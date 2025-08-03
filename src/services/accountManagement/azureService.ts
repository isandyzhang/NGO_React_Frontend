import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest, popupLoginRequest, parseAzureError, isAzureConfigured } from '../../config/azureConfig';
import { config } from '../../config/env';
import { AzureUser, LoginMethod, LoginResult } from '../../types/userTypes';

/**
 * Azure AD 身份驗證服務
 * 使用 Microsoft Authentication Library (MSAL) 處理 Azure AD 登入
 */
class AzureService {
  private msalInstance: PublicClientApplication | null = null;
  private isInitialized = false;

  /**
   * 初始化 MSAL 實例
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized || !isAzureConfigured()) {
      return;
    }

    try {
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
      this.isInitialized = true;
      
      if (config.azure.debugMode) {
        console.log('Azure MSAL 初始化成功');
      }
    } catch (error) {
      console.error('Azure MSAL 初始化失敗:', error);
      throw new Error('Azure AD 服務初始化失敗');
    }
  }

  /**
   * 檢查是否已啟用 Azure AD 登入
   */
  public isEnabled(): boolean {
    return config.azure.enableAzureLogin && isAzureConfigured();
  }

  /**
   * 清理進行中的交互狀態
   */
  public async clearInProgressInteraction(): Promise<void> {
    try {
      if (!this.msalInstance) {
        return;
      }

      // 嘗試處理任何未完成的重導向
      await this.msalInstance.handleRedirectPromise();
      
      if (config.azure.debugMode) {
        console.log('已清理進行中的交互狀態');
      }
    } catch (error: any) {
      console.warn('清理交互狀態時出錯:', error);
    }
  }

  /**
   * 獲取 MSAL 實例
   */
  private async getMsalInstance(): Promise<PublicClientApplication> {
    if (!this.isEnabled()) {
      throw new Error('Azure AD 登入未啟用');
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.msalInstance) {
      throw new Error('MSAL 實例初始化失敗');
    }

    return this.msalInstance;
  }

  /**
   * Azure AD 登入
   */
  public async login(): Promise<LoginResult> {
    try {
      const msalInstance = await this.getMsalInstance();
      
      // 先清理任何進行中的交互狀態
      await this.clearInProgressInteraction();
      
      // 檢查是否有進行中的交互，如果有則先處理
      try {
        const redirectResult = await msalInstance.handleRedirectPromise();
        if (redirectResult) {
          // 如果有重導向結果，處理它
          if (redirectResult.account) {
            const azureUser = this.mapAccountToAzureUser(redirectResult.account);
            this.saveAzureUser(azureUser);
            
            if (config.azure.debugMode) {
              console.log('處理現有重導向結果:', azureUser);
            }
            
            return {
              success: true,
              message: '登入成功',
              user: azureUser,
              method: LoginMethod.AZURE_AD,
            };
          }
        }
      } catch (error: any) {
        // 如果是 interaction_in_progress 錯誤，等待一會再重試
        if (error.errorCode === 'interaction_in_progress') {
          if (config.azure.debugMode) {
            console.log('檢測到進行中的交互，等待 2 秒後重試...');
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 再次嘗試處理
          try {
            const retryResult = await msalInstance.handleRedirectPromise();
            if (retryResult && retryResult.account) {
              const azureUser = this.mapAccountToAzureUser(retryResult.account);
              this.saveAzureUser(azureUser);
              
              return {
                success: true,
                message: '登入成功',
                user: azureUser,
                method: LoginMethod.AZURE_AD,
              };
            }
          } catch (retryError: any) {
            console.warn('重試處理重導向時出錯:', retryError);
          }
        } else {
          console.warn('處理現有重導向時出錯:', error);
        }
      }

      let result: AuthenticationResult;

      if (config.azure.usePopupLogin) {
        // 使用彈出視窗登入
        result = await msalInstance.loginPopup(popupLoginRequest);
      } else {
        // 使用重導向登入
        await msalInstance.loginRedirect(loginRequest);
        // 重導向登入會重新載入頁面，這裡不會執行到
        return {
          success: true,
          message: '正在重導向到 Azure AD...',
          method: LoginMethod.AZURE_AD,
        };
      }

      // 處理登入結果
      if (result && result.account) {
        const azureUser = this.mapAccountToAzureUser(result.account);
        
        // 儲存到 localStorage
        this.saveAzureUser(azureUser);
        
        if (config.azure.debugMode) {
          console.log('Azure AD 登入成功:', azureUser);
        }

        // 同步Azure用戶到本地資料庫
        try {
          const { authService } = await import('./authService');
          const syncResult = await authService.syncAzureUser(azureUser);
          
          if (syncResult.success) {
            console.log('Azure用戶同步成功:', syncResult.message);
            
            // 如果有預設密碼，提醒用戶
            if (syncResult.defaultPassword) {
              console.log('您的預設密碼是:', syncResult.defaultPassword);
              console.log('建議您登入後立即變更密碼');
            }
          } else {
            console.warn('Azure用戶同步失敗:', syncResult.message);
          }
        } catch (syncError: any) {
          console.error('Azure用戶同步過程中發生錯誤:', syncError.message);
        }

        return {
          success: true,
          message: '登入成功',
          user: azureUser,
          method: LoginMethod.AZURE_AD,
        };
      }

      return {
        success: false,
        message: '登入失敗：未獲取到使用者資訊',
        method: LoginMethod.AZURE_AD,
      };

    } catch (error: any) {
      console.error('Azure AD 登入失敗:', error);
      const parsedError = parseAzureError(error);
      
      return {
        success: false,
        message: parsedError.message,
        method: LoginMethod.AZURE_AD,
      };
    }
  }

  /**
   * 處理重導向登入結果
   */
  public async handleRedirectResult(): Promise<LoginResult | null> {
    try {
      const msalInstance = await this.getMsalInstance();
      
      // 檢查 URL 是否包含 hash 或是 Azure AD 重導向
      const currentUrl = window.location.href;
      const hasHash = window.location.hash.length > 0;
      const hasCode = currentUrl.includes('code=');
      const hasState = currentUrl.includes('state=');
      
      if (config.azure.debugMode) {
        console.log('檢查重導向狀態:', { hasHash, hasCode, hasState, url: currentUrl });
      }

      // 只在確實有重導向參數時才處理
      if (!hasHash && !hasCode && !hasState) {
        return null;
      }

      const result = await msalInstance.handleRedirectPromise();

      if (result && result.account) {
        const azureUser = this.mapAccountToAzureUser(result.account);
        this.saveAzureUser(azureUser);
        
        if (config.azure.debugMode) {
          console.log('處理重導向登入結果成功:', azureUser);
        }

        // 同步Azure用戶到本地資料庫
        try {
          const { authService } = await import('./authService');
          const syncResult = await authService.syncAzureUser(azureUser);
          
          if (syncResult.success) {
            console.log('Azure用戶同步成功:', syncResult.message);
            
            // 如果有預設密碼，提醒用戶
            if (syncResult.defaultPassword) {
              console.log('您的預設密碼是:', syncResult.defaultPassword);
              console.log('建議您登入後立即變更密碼');
            }
          } else {
            console.warn('Azure用戶同步失敗:', syncResult.message);
          }
        } catch (syncError: any) {
          console.error('Azure用戶同步過程中發生錯誤:', syncError.message);
        }

        // 清理 URL 中的 hash 和參數
        window.history.replaceState({}, document.title, window.location.pathname);

        return {
          success: true,
          message: '登入成功',
          user: azureUser,
          method: LoginMethod.AZURE_AD,
        };
      }

      // 如果沒有結果但有重導向參數，可能是錯誤狀態
      if (hasHash || hasCode) {
        console.warn('Azure AD 重導向包含參數但無登入結果');
        // 清理 URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return null;
    } catch (error: any) {
      console.error('處理重導向登入結果失敗:', error);
      
      // 如果是 hash_empty_error，清理 URL 並返回 null
      if (error.errorCode === 'hash_empty_error' || error.message?.includes('hash_empty_error')) {
        console.warn('遇到 hash_empty_error，清理 URL');
        window.history.replaceState({}, document.title, window.location.pathname);
        return null;
      }
      
      const parsedError = parseAzureError(error);
      
      return {
        success: false,
        message: parsedError.message,
        method: LoginMethod.AZURE_AD,
      };
    }
  }

  /**
   * 登出
   */
  public async logout(): Promise<void> {
    try {
      if (!this.isEnabled()) {
        return;
      }

      const msalInstance = await this.getMsalInstance();
      const account = this.getCurrentAccount();

      // 先清除 localStorage
      this.clearAzureUser();

      if (config.azure.debugMode) {
        console.log('Azure AD 開始登出流程');
      }

      if (account) {
        if (config.azure.usePopupLogin) {
          await msalInstance.logoutPopup({
            account,
            postLogoutRedirectUri: config.azure.logoutUri,
          });
          
          // 彈出式登出不會自動跳轉，手動導航到登入頁面
          if (config.azure.debugMode) {
            console.log('彈出式登出完成，導航到登入頁面');
          }
          window.location.href = '/login';
        } else {
          await msalInstance.logoutRedirect({
            account,
            postLogoutRedirectUri: config.azure.logoutUri,
          });
        }
      } else {
        // 即使沒有 account，也要強制跳轉到登入頁面
        if (config.azure.debugMode) {
          console.log('沒有 Azure 帳戶，直接跳轉到登入頁面');
        }
        
        // 清理 URL 參數並跳轉到登入頁面
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = '/login';
      }

      if (config.azure.debugMode) {
        console.log('Azure AD 登出成功');
      }
    } catch (error) {
      console.error('Azure AD 登出失敗:', error);
      // 即使登出失敗，也要清除本地資料
      this.clearAzureUser();
      
      // 強制跳轉到登入頁面
      if (config.azure.debugMode) {
        console.log('登出失敗，強制跳轉到登入頁面');
      }
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = config.azure.logoutUri || '/login';
    }
  }

  /**
   * 獲取存取令牌
   */
  public async getAccessToken(): Promise<string | null> {
    try {
      const msalInstance = await this.getMsalInstance();
      const account = this.getCurrentAccount();

      if (!account) {
        return null;
      }

      const result = await msalInstance.acquireTokenSilent({
        scopes: loginRequest.scopes || ['User.Read'],
        account,
      });

      return result.accessToken;
    } catch (error) {
      console.error('獲取 Azure AD 存取令牌失敗:', error);
      return null;
    }
  }

  /**
   * 獲取目前登入的帳戶
   */
  private getCurrentAccount(): AccountInfo | null {
    if (!this.msalInstance) {
      return null;
    }

    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * 將 MSAL AccountInfo 轉換為 AzureUser（帶有預設角色）
   */
  private mapAccountToAzureUser(account: AccountInfo): AzureUser & { role: string } {
    return {
      id: account.localAccountId,
      displayName: account.name || account.username,
      email: account.username,
      givenName: account.idTokenClaims?.given_name as string,
      surname: account.idTokenClaims?.family_name as string,
      userPrincipalName: account.username,
      tenantId: account.tenantId,
      loginSource: 'azure',
      role: 'staff', // Azure AD 使用者預設為 staff 角色
    };
  }

  /**
   * 儲存 Azure 使用者資訊到 localStorage
   */
  private saveAzureUser(user: AzureUser): void {
    localStorage.setItem('azureUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('loginMethod', 'azure');
  }

  /**
   * 從 localStorage 獲取 Azure 使用者資訊
   */
  public getStoredAzureUser(): AzureUser | null {
    try {
      const stored = localStorage.getItem('azureUser');
      const loginMethod = localStorage.getItem('loginMethod');
      
      if (stored && loginMethod === 'azure') {
        return JSON.parse(stored);
      }
      
      return null;
    } catch (error) {
      console.error('讀取 Azure 使用者資訊失敗:', error);
      return null;
    }
  }

  /**
   * 清除 Azure 使用者資訊
   */
  private clearAzureUser(): void {
    // 先檢查登入方式再清除
    const loginMethod = localStorage.getItem('loginMethod');
    
    localStorage.removeItem('azureUser');
    localStorage.removeItem('loginMethod');
    
    // 只有在 Azure 登入時才清除 isAuthenticated
    if (loginMethod === 'azure') {
      localStorage.removeItem('isAuthenticated');
    }
  }

  /**
   * 檢查是否已透過 Azure AD 登入
   */
  public isAuthenticated(): boolean {
    const loginMethod = localStorage.getItem('loginMethod');
    const isAuth = localStorage.getItem('isAuthenticated');
    const azureUser = this.getStoredAzureUser();
    
    return loginMethod === 'azure' && isAuth === 'true' && azureUser !== null;
  }
}

// 建立單例實例
export const azureService = new AzureService();
export default azureService;
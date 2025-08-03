import { CalendarEvent } from './scheduleService';

/**
 * 日曆事件 API 服務
 * 
 * 此檔案包含所有與行事曆事件相關的 API 呼叫函數。
 * 目前使用模擬資料，但可以輕易替換為真實的 API 端點。
 */

// 模擬延遲函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模擬資料儲存（實際應用中會連接到資料庫）
// 使用動態日期，確保活動始終在未來幾天內
const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const dayAfterTomorrow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
const fourDaysLater = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
const fiveDaysLater = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
const sixDaysLater = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);

let mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '個案家庭訪問 - 陳小明',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
    type: 'case-visit',
    description: '定期個案家庭訪問，了解近期生活狀況及物資需求評估',
  },
  {
    id: '2',
    title: '新志工培訓工作坊',
    start: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 14, 0),
    end: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 17, 0),
    type: 'training',
    description: '新進志工基礎培訓課程，包含個案服務流程介紹',
  },
  {
    id: '3',
    title: '個案家庭訪問 - 李阿嬤',
    start: new Date(threeDaysLater.getFullYear(), threeDaysLater.getMonth(), threeDaysLater.getDate(), 10, 0),
    end: new Date(threeDaysLater.getFullYear(), threeDaysLater.getMonth(), threeDaysLater.getDate(), 12, 0),
    type: 'case-visit',
    description: '關懷獨居長者生活狀況，檢查居家安全環境',
  },
  {
    id: '4',
    title: '社區關懷活動籌備會議',
    start: new Date(threeDaysLater.getFullYear(), threeDaysLater.getMonth(), threeDaysLater.getDate(), 15, 0),
    end: new Date(threeDaysLater.getFullYear(), threeDaysLater.getMonth(), threeDaysLater.getDate(), 17, 0),
    type: 'meeting',
    description: '討論下週社區關懷活動的籌備工作分配',
  },
  {
    id: '5',
    title: '青少年職涯探索工作坊',
    start: new Date(fourDaysLater.getFullYear(), fourDaysLater.getMonth(), fourDaysLater.getDate(), 9, 0),
    end: new Date(fourDaysLater.getFullYear(), fourDaysLater.getMonth(), fourDaysLater.getDate(), 16, 0),
    type: 'activity',
    description: '為弱勢家庭青少年舉辦職涯探索活動，邀請業界講師分享',
  },
  {
    id: '6',
    title: '長者數位學習課程',
    start: new Date(fiveDaysLater.getFullYear(), fiveDaysLater.getMonth(), fiveDaysLater.getDate(), 13, 30),
    end: new Date(fiveDaysLater.getFullYear(), fiveDaysLater.getMonth(), fiveDaysLater.getDate(), 16, 30),
    type: 'activity',
    description: '教導長者使用智慧型手機和網路服務，提升數位能力',
  },
  {
    id: '7',
    title: '個案服務督導會議',
    start: new Date(sixDaysLater.getFullYear(), sixDaysLater.getMonth(), sixDaysLater.getDate(), 10, 0),
    end: new Date(sixDaysLater.getFullYear(), sixDaysLater.getMonth(), sixDaysLater.getDate(), 12, 0),
    type: 'meeting',
    description: '個案服務進度檢討與困難案例討論',
  },
  {
    id: '8',
    title: '環保淨灘志工活動',
    start: new Date(sixDaysLater.getFullYear(), sixDaysLater.getMonth(), sixDaysLater.getDate(), 8, 0),
    end: new Date(sixDaysLater.getFullYear(), sixDaysLater.getMonth(), sixDaysLater.getDate(), 12, 0),
    type: 'activity',
    description: '招募志工參與海岸線環境保護行動，培養環保意識',
  },
];

/**
 * 取得所有事件
 * @returns Promise<CalendarEvent[]> 事件陣列
 */
export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  // 模擬 API 延遲
  await delay(500);
  
  // 實際 API 呼叫範例：
  // const response = await fetch('/api/calendar/events');
  // const events = await response.json();
  // return events;
  
  return [...mockEvents];
};

/**
 * 建立新事件
 * @param eventData 事件資料（不包含 ID）
 * @returns Promise<CalendarEvent> 建立的事件
 */
export const createEvent = async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
  // 模擬 API 延遲
  await delay(300);
  
  const newEvent: CalendarEvent = {
    ...eventData,
    id: Date.now().toString(), // 簡單的 ID 生成
  };
  
  // 實際 API 呼叫範例：
  // const response = await fetch('/api/calendar/events', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(eventData),
  // });
  // const createdEvent = await response.json();
  
  mockEvents.push(newEvent);
  return newEvent;
};

/**
 * 更新事件
 * @param event 要更新的事件
 * @returns Promise<CalendarEvent> 更新後的事件
 */
export const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  // 模擬 API 延遲
  await delay(300);
  
  // 實際 API 呼叫範例：
  // const response = await fetch(`/api/calendar/events/${event.id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // });
  // const updatedEvent = await response.json();
  
  const index = mockEvents.findIndex(e => e.id === event.id);
  if (index !== -1) {
    mockEvents[index] = event;
  }
  
  return event;
};

/**
 * 刪除事件
 * @param eventId 要刪除的事件 ID
 * @returns Promise<boolean> 是否成功刪除
 */
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  // 模擬 API 延遲
  await delay(300);
  
  // 實際 API 呼叫範例：
  // const response = await fetch(`/api/calendar/events/${eventId}`, {
  //   method: 'DELETE',
  // });
  // return response.ok;
  
  const index = mockEvents.findIndex(e => e.id === eventId);
  if (index !== -1) {
    mockEvents.splice(index, 1);
    return true;
  }
  
  return false;
};

/**
 * 依據日期範圍取得事件
 * @param startDate 開始日期
 * @param endDate 結束日期
 * @returns Promise<CalendarEvent[]> 指定範圍內的事件
 */
export const getEventsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  await delay(300);
  
  // 實際 API 呼叫範例：
  // const response = await fetch(
  //   `/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
  // );
  // const events = await response.json();
  
  return mockEvents.filter(event => 
    event.start >= startDate && event.end <= endDate
  );
};

/**
 * 依據事件類型取得事件
 * @param type 事件類型
 * @returns Promise<CalendarEvent[]> 指定類型的事件
 */
export const getEventsByType = async (
  type: CalendarEvent['type']
): Promise<CalendarEvent[]> => {
  await delay(300);
  
  // 實際 API 呼叫範例：
  // const response = await fetch(`/api/calendar/events?type=${type}`);
  // const events = await response.json();
  
  return mockEvents.filter(event => event.type === type);
}; 
import { CalendarEvent } from '../components/CalendarPage';

/**
 * 日曆事件 API 服務
 * 
 * 此檔案包含所有與行事曆事件相關的 API 呼叫函數。
 * 目前使用模擬資料，但可以輕易替換為真實的 API 端點。
 */

// 模擬延遲函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模擬資料儲存（實際應用中會連接到資料庫）
let mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '個案家庭訪問 - 陳小明',
    start: new Date(2024, 11, 15, 9, 0),
    end: new Date(2024, 11, 15, 11, 0),
    type: 'case-visit',
    description: '定期個案家庭訪問，了解近期生活狀況',
  },
  {
    id: '2',
    title: '志工培訓工作坊',
    start: new Date(2024, 11, 18, 14, 0),
    end: new Date(2024, 11, 18, 17, 0),
    type: 'training',
    description: '新進志工基礎培訓課程',
  },
  {
    id: '3',
    title: '月度團隊會議',
    start: new Date(2024, 11, 20, 10, 0),
    end: new Date(2024, 11, 20, 12, 0),
    type: 'meeting',
    description: '討論本月工作進度和下月計劃',
  },
  {
    id: '4',
    title: '聖誕節關懷活動',
    start: new Date(2024, 11, 24, 9, 0),
    end: new Date(2024, 11, 24, 16, 0),
    type: 'activity',
    description: '為弱勢家庭舉辦聖誕節關懷活動',
  },
  {
    id: '5',
    title: '年終檢討會議',
    start: new Date(2024, 11, 30, 13, 0),
    end: new Date(2024, 11, 30, 16, 0),
    type: 'meeting',
    description: '2024年度工作成果檢討與2025年規劃',
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
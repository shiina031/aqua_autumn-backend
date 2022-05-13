// イベントタイプ
type EventType = 'bath' | 'sauna' | 'exercise' | 'meal';

// ソートタイプ
const SORT_DEFAULT = { eventType: 1 };
const SORT_START_DATE_ASC = { startDate: 1 };
const SORT_FINAL_DATE_ASC = { finalDate: 1 };

export { EventType, SORT_DEFAULT, SORT_START_DATE_ASC, SORT_FINAL_DATE_ASC };

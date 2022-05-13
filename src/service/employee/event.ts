import { Request, Response } from 'express';
import { authenticateUser, fetchLoginUserId } from '../../auth/auth';
import { EventType, SORT_DEFAULT, SORT_FINAL_DATE_ASC, SORT_START_DATE_ASC } from '../../definition/eventType';
import { USER_ROLE_LEVEL_EMPLOYEE, USER_ROLE_LEVEL_MANAGER } from '../../definition/userRole';
import { eventModel } from '../../models/Event';
import { CreateEventData, EventInformation, UpdateEventInformation } from '../../types/eventTypes';

// イベント新規作成
const createEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    const eventName: string = req.body.eventName;
    const eventType: EventType = req.body.eventType;
    const mainImage: string = req.body.mainImage;
    const subImage: string | undefined = req.body.subImage;
    const description: string = req.body.description;
    const detail: string = req.body.detail;
    const inCharge: string = req.body.inCharge;
    const makedUser = fetchLoginUserId(req, res);
    const startDate: Date = req.body.startDate;
    const finalDate: Date = req.body.finalDate;
    const fee: number | undefined = req.body.fee;
    const capacity: number | undefined = req.body.capacity;

    const createEventData: CreateEventData = {
      eventName,
      eventType,
      mainImage,
      subImage,
      description,
      detail,
      inCharge,
      makedUser,
      startDate,
      finalDate,
      fee,
      capacity,
    };

    try {
      await eventModel.create(createEventData);
      return res.status(200).json({ processStatus: 'OK', message: 'イベントの作成に成功しました', data: null });
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'create_event_process_failed: イベントの作成に失敗しました',
        data: null,
      });
    }
  });
};

// イベント検索
const searchEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_EMPLOYEE, async () => {
    // 要求ページ
    const page: number = req.body.page || 1;

    // ソート
    let sort = SORT_DEFAULT;
    if (req.body.sort === 'SORT_START_DATE_ASC') {
      // @ts-ignore
      sort = SORT_START_DATE_ASC;
    } else if (req.body.sort === 'SORT_FINAL_DATE_ASC') {
      // @ts-ignore
      sort = SORT_FINAL_DATE_ASC;
    }

    // 検索条件
    const searchCondition = createSearchCondition(req);

    try {
      const getEvents = await eventModel
        .find(searchCondition)
        .select('-createdAt -updatedAt -deleteFlg')
        .sort(sort)
        .skip((page - 1) * 10)
        .limit(10);
      return res.status(200).json({ processStatus: 'OK', message: 'イベント検索に成功しました', data: getEvents });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'get_event_process_faied: イベント検索に失敗しました', data: null });
    }
  });
};

// イベント照会
const getEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_EMPLOYEE, async () => {
    const targetEventId = req.params.id;
    try {
      const eventInformation: EventInformation | null = await eventModel
        .findById(targetEventId)
        .select('-createdAt -updatedAt');
      if (!eventInformation) {
        return res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_event_not_found: 存在しないイベントです', data: null });
      }
      return res
        .status(200)
        .json({ processStatus: 'OK', message: 'イベント情報取得に成功しました', data: eventInformation });
    } catch (error) {
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'get_event_process_faied: イベント情報取得に失敗しました', data: null });
    }
  });
};

// イベント編集
const editEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    const targetEventId = req.params.id;
    const {
      eventName,
      eventType,
      mainImage,
      subImage,
      description,
      detail,
      inCharge,
      startDate,
      finalDate,
      fee,
      capacity,
      updateVersion,
      closedFlg,
    } = req.body;

    const updatedUser = fetchLoginUserId(req, res);

    const updateInformation: UpdateEventInformation = {
      eventName,
      eventType,
      mainImage,
      subImage,
      description,
      detail,
      inCharge,
      updatedUser,
      startDate,
      finalDate,
      fee,
      capacity,
      updateVersion: updateVersion + 1,
      closedFlg,
    };
    try {
      const updateEvent: EventInformation | null = await eventModel
        .findOneAndUpdate({ _id: targetEventId }, updateInformation, { new: true })
        .select('-createdAt -updatedAt');
      if (!updateEvent) {
        res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_event_not_found: 存在しないイベントです', data: null });
      }
      return res
        .status(200)
        .json({ processStatus: 'OK', message: 'イベント情報更新に成功しました', data: updateEvent });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        processStatus: 'NG',
        message: 'update_event_process_faied: イベント情報更新に失敗しました',
        data: null,
      });
    }
  });
};

// イベント削除
const deleteEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_MANAGER, async () => {
    const targetEventId = req.params.id;
    try {
      const deleteEvent: EventInformation | null = await eventModel.findOneAndUpdate(
        { _id: targetEventId },
        { deleteFlg: true },
        { new: true }
      );

      if (!deleteEvent) {
        res
          .status(404)
          .json({ processStatus: 'NG', message: 'target_event_not_found: 存在しないイベントです', data: null });
      }
      return res.status(200).json({ processStatus: 'OK', message: 'イベント情報削除に成功しました', data: null });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        processStatus: 'NG',
        message: 'delete_event_process_faied: イベント情報削除に失敗しました',
        data: null,
      });
    }
  });
};

export { createEvent, searchEvent, getEvent, editEvent, deleteEvent };

// 検索条件作成関数
const createSearchCondition = (req: Request) => {
  let searchCondition = {};
  // 検索条件
  const searchConditionData = req.body.searchConditionData;
  // イベントタイプ
  if (searchConditionData.eventType !== null && searchConditionData.eventType !== undefined) {
    searchCondition = { ...searchCondition, eventType: { $in: searchConditionData.eventType } };
  }
  // 担当者
  if (searchConditionData.inCharge) {
    searchCondition = { ...searchCondition, inCharge: searchConditionData.inCharge };
  }
  // 開始日
  if (searchConditionData.startDateBefore && searchConditionData.startDateAfter) {
    searchCondition = {
      ...searchCondition,
      startDate: {
        $gte: searchConditionData.startDateBefore,
        $lte: searchConditionData.startDateAfter,
      },
    };
  } else if (searchConditionData.startDateBefore && !searchConditionData.startDateAfter) {
    searchCondition = {
      ...searchCondition,
      startDate: {
        $gte: searchConditionData.startDateBefore,
      },
    };
  } else if (!searchConditionData.startDateBefore && searchConditionData.startDateAfter) {
    searchCondition = {
      ...searchCondition,
      startDate: {
        $lte: searchConditionData.startDateAfter,
      },
    };
  }
  // 終了日
  if (searchConditionData.finalDateBefore && searchConditionData.finalDateAfter) {
    searchCondition = {
      ...searchCondition,
      finalDate: {
        $gte: searchConditionData.finalDateBefore,
        $lte: searchConditionData.finalDateAfter,
      },
    };
  } else if (searchConditionData.finalDateBefore && !searchConditionData.finalDateAfter) {
    searchCondition = {
      ...searchCondition,
      finalDate: {
        $gte: searchConditionData.finalDateBefore,
      },
    };
  } else if (!searchConditionData.finalDateBefore && searchConditionData.finalDateAfter) {
    searchCondition = {
      ...searchCondition,
      finalDate: {
        $lte: searchConditionData.finalDateAfter,
      },
    };
  }
  // 締め切り
  if (searchConditionData.closedFlg) {
    searchCondition = { ...searchCondition, closedFlg: true };
  } else {
    searchCondition = { ...searchCondition, closedFlg: false };
  }
  // 削除済み
  if (searchConditionData.deleteFlg) {
    searchCondition = { ...searchCondition, deleteFlg: true };
  } else {
    searchCondition = { ...searchCondition, deleteFlg: false };
  }

  return searchCondition;
};

import { Request, Response } from 'express';
import { authenticateUser, fetchLoginUserId } from '../../auth/auth';
import { SORT_DEFAULT, SORT_FINAL_DATE_ASC, SORT_START_DATE_ASC } from '../../definition/eventType';
import { USER_ROLE_LEVEL_CUSTERMER } from '../../definition/userRole';
import { eventModel } from '../../models/Event';
import { userEventMappingModel } from '../../models/UserEventMapping';
import { EventInformationForCustomer } from '../../types/eventTypes';

// イベント検索
const searchEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
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
      const getEvents: EventInformationForCustomer[] | [] = await eventModel
        .find({ ...searchCondition, closedflg: false, deleteFlg: false })
        .select('-createdAt -updatedAt -makedUser -updateVersion -updatedUser -inCharge -closedflg -deleteFlg')
        .sort(sort)
        .skip((page - 1) * 10)
        .limit(10);
      return res.status(200).json({ processStatus: 'OK', message: 'イベント検索に成功しました', data: getEvents });
    } catch (error) {
      return res
        .status(500)
        .json({ processStatus: 'NG', message: 'get_event_process_faied: イベント検索に失敗しました', data: null });
    }
  });
};

// イベント照会
const getEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetEventId = req.params.id;
    try {
      const eventInformation: EventInformationForCustomer | null = await eventModel
        .findById(targetEventId)
        .select('-createdAt -updatedAt -makedUser -updateVersion -updatedUser -inCharge -closedflg -deleteFlg');
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

// 予約イベント照会
const getReservedEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetUserId = fetchLoginUserId(req, res);
    if (!targetUserId) {
      return res.status(400).json({ processStatus: 'NG', message: 'ユーザーの識別ができません', data: null });
    }
    try {
      const reserveEventIdList: string[] | [] = await userEventMappingModel
        .findById({ userId: targetUserId })
        .select('reservation');
      if (reserveEventIdList.length === 0) {
        return res.status(200).json({ processStatus: 'OK', message: '予約イベントの取得に成功しました', data: [] });
      }
      const reservedEventList: EventInformationForCustomer[] = await eventModel
        .find({ _id: { $in: reserveEventIdList } })
        .select('-createdAt -updatedAt -makedUser -updateVersion -updatedUser -inCharge -closedflg -deleteFlg');
      return res
        .status(200)
        .json({ processStatus: 'OK', message: '予約イベントの取得に成功しました', data: reservedEventList });
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'get_reserve_event_process_faied:予約イベントの取得に失敗しました',
        data: null,
      });
    }
  });
};

// 気になるイベント照会
const getInterestedInEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetUserId = fetchLoginUserId(req, res);
    if (!targetUserId) {
      return res.status(400).json({ processStatus: 'NG', message: 'ユーザーの識別ができません', data: null });
    }
    try {
      const interestedInEventIdList: string[] | [] = await userEventMappingModel
        .findById({ userId: targetUserId })
        .select('interestedIn');
      if (interestedInEventIdList.length === 0) {
        return res.status(200).json({ processStatus: 'OK', message: '気になるイベントの取得に成功しました', data: [] });
      }
      const interestedInEventList: EventInformationForCustomer[] = await eventModel
        .find({ _id: { $in: interestedInEventIdList } })
        .select('-createdAt -updatedAt -makedUser -updateVersion -updatedUser -inCharge -closedflg -deleteFlg');
      return res
        .status(200)
        .json({ processStatus: 'OK', message: '予約イベントの取得に成功しました', data: interestedInEventList });
    } catch (error) {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'get_reserve_event_process_faied:予約イベントの取得に失敗しました',
        data: null,
      });
    }
  });
};

// イベント予約
const reserveEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetEventId = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (loginUserId) {
      try {
        // 空きがあるかどうかチェック
        const { reserved, closedFlg } = await eventModel.findById({ _id: targetEventId }).select('reserved closedFlg');
        if (closedFlg) {
          return res.status(400).json({ processStatus: 'NG', message: 'このイベントは予約できません', data: null });
        }
        // ユーザーイベントマッピングテーブルへイベントIDを挿入
        const result = await userEventMappingModel.findOneAndUpdate(
          { userId: loginUserId },
          { $push: { reservation: targetEventId } },
          { new: true, upsert: true }
        );
        // イベントテーブルの予約者数を+1し、上限に達した場合はクローズする
        const updatedEvent = await eventModel.findByIdAndUpdate(
          { _id: targetEventId },
          { reserved: reserved + 1 },
          { new: true, projection: 'reserved capacity' }
        );
        if (updatedEvent.reserved >= updatedEvent.capacity) {
          await eventModel.findByIdAndUpdate({ _id: targetEventId }, { closedFlg: true });
        }
        return res.status(200).json({ processStatus: 'OK', message: 'イベント予約に成功しました', data: result });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          processStatus: 'NG',
          message: 'reserve_event_process_faied: イベント予約に失敗しました',
          data: null,
        });
      }
    } else {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'reserve_event_process_faied: イベント予約に失敗しました',
        data: null,
      });
    }
  });
};

// イベント予約キャンセル
const cancelReserveEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetEventId = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (loginUserId) {
      try {
        // キャンセル可能な日付かをチェック
        const { reserved, startDate } = await eventModel.findById({ _id: targetEventId }).select('reserved startDate');
        const today = new Date(Date.now());
        const deadline = new Date(startDate.getDate() - 3);
        if (today > deadline) {
          return res
            .status(400)
            .json({ processStatus: 'NG', message: 'このイベントは予約キャンセルできません', data: null });
        }
        // ユーザーイベントマッピングテーブルからイベントIDを削除
        const result = await userEventMappingModel.findOneAndUpdate(
          { userId: loginUserId },
          { $pull: { reservation: targetEventId } },
          { new: true, upsert: true }
        );
        // イベントテーブルの予約者数を-1し、上限を下回った場合はオープンする
        const updatedEvent = await eventModel.findByIdAndUpdate(
          { _id: targetEventId },
          { reserved: reserved - 1 },
          { new: true, projection: 'reserved capacity' }
        );
        if (updatedEvent.reserved < updatedEvent.capacity) {
          await eventModel.findByIdAndUpdate({ _id: targetEventId }, { closedFlg: false });
        }
        return res
          .status(200)
          .json({ processStatus: 'OK', message: 'イベント予約キャンセルに成功しました', data: result });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          processStatus: 'NG',
          message: 'reserve_event_process_faied: イベント予約キャンセルに失敗しました',
          data: null,
        });
      }
    } else {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'reserve_event_process_faied: イベント予約に失敗しました',
        data: null,
      });
    }
  });
};

// 気になる登録
const interestedEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetEventId = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (loginUserId) {
      try {
        const result = await userEventMappingModel.findOneAndUpdate(
          { userId: loginUserId },
          { $push: { interestedIn: targetEventId } },
          { new: true, upsert: true }
        );
        return res
          .status(200)
          .json({ processStatus: 'OK', message: 'イベント気になる登録に成功しました', data: result });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          processStatus: 'NG',
          message: 'interested_event_process_faied: イベント気になる登録に失敗しました',
          data: null,
        });
      }
    } else {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'interested_event_process_faied: イベント気になる登録に失敗しました',
        data: null,
      });
    }
  });
};

// 気になる解除
const cancelInterestedEvent = (req: Request, res: Response) => {
  authenticateUser(req, res, USER_ROLE_LEVEL_CUSTERMER, async () => {
    const targetEventId = req.params.id;
    const loginUserId = fetchLoginUserId(req, res);
    if (loginUserId) {
      try {
        const result = await userEventMappingModel.findOneAndUpdate(
          { userId: loginUserId },
          { $pull: { interestedIn: targetEventId } },
          { new: true }
        );
        return res
          .status(200)
          .json({ processStatus: 'OK', message: 'イベント気になる解除に成功しました', data: result });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          processStatus: 'NG',
          message: 'interested_event_process_faied: イベント気になる解除に失敗しました',
          data: null,
        });
      }
    } else {
      return res.status(500).json({
        processStatus: 'NG',
        message: 'interested_event_process_faied: イベント気になる解除に失敗しました',
        data: null,
      });
    }
  });
};

export {
  searchEvent,
  getEvent,
  getReservedEvent,
  getInterestedInEvent,
  reserveEvent,
  cancelReserveEvent,
  interestedEvent,
  cancelInterestedEvent,
};

// 検索条件作成関数
const createSearchCondition = (req: Request) => {
  let searchCondition = {};
  // 検索条件
  const searchConditionData = req.body.searchConditionData;
  // イベントタイプ
  if (searchConditionData?.eventType !== null && searchConditionData?.eventType !== undefined) {
    searchCondition = { ...searchCondition, eventType: { $in: searchConditionData.eventType } };
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
  return searchCondition;
};

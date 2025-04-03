import {getUserSubscription} from './api/GetUserSubscription.ts'
import {createUserSubscription} from './api/CreateUserSubscription'
import {cancelSubscription} from './api/CancelSubscription'
import {updateSubscription} from './api/UpdateSubscription'
import {getAllSubscriptionTypes} from './api/GetAllSubscription'
import {SubscriptionType} from './types'


export const SubscriptionService = {

  getUserSubscription,
  createUserSubscription,
  cancelSubscription,
  updateSubscription,
  getAllSubscriptionTypes,
  SubscriptionType
};

export { SubscriptionType }; 
import Subscription from "../../domain/entities/Subscription.js";

export default interface SubscriptionResponse {
  userId: string;
  requestId: string;
  createdAt: Date | null;
}

export function mapSubscriptionToResponse(subscription: Subscription): SubscriptionResponse {
  return {
    userId: subscription.userId.getValue(),
    requestId: subscription.requestId.getValue(),
    createdAt: subscription.createdAt
  };
}

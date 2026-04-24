<?php

namespace App\Notifications;

use App\Models\ConnectionRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FriendRequestAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected User $acceptedBy,
        protected ConnectionRequest $connectionRequest,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Friend request accepted',
            'message' => $this->acceptedBy->name.' accepted your friend request.',
            'accepted_by_user_id' => $this->acceptedBy->id,
            'connection_request_id' => $this->connectionRequest->id,
            'url' => route('friends.index'),
        ];
    }
}

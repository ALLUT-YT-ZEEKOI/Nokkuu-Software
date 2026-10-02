<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Friend;
use App\Models\UplyNotification;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Accepted friends
        $friendships = Friend::where(function($q) use ($user) {
            $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
        })->where('status', 'accepted')
        ->with(['user', 'friend'])
        ->get();

        $friends = $friendships->map(function($f) use ($user) {
            return $f->user_id == $user->id ? $f->friend : $f->user;
        });

        // Pending requests sent TO me
        $pendingIncoming = Friend::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user')
            ->get();

        // Pending requests sent BY me
        $pendingOutgoing = Friend::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('friend')
            ->get();

        return response()->json([
            'friends' => $friends,
            'pending_incoming' => $pendingIncoming,
            'pending_outgoing' => $pendingOutgoing,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('query', '');
        $currentUserId = $request->user()->id;

        if (strlen($query) < 2) {
            return response()->json(['users' => []]);
        }

        $users = User::where('id', '!=', $currentUserId)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->take(10)
            ->get();

        // Attach friend status to each searched user
        $users = $users->map(function($u) use ($currentUserId) {
            $friendship = Friend::where(function($q) use ($currentUserId, $u) {
                $q->where('user_id', $currentUserId)->where('friend_id', $u->id);
            })->orWhere(function($q) use ($currentUserId, $u) {
                $q->where('user_id', $u->id)->where('friend_id', $currentUserId);
            })->first();

            $u->friendship_status = $friendship ? $friendship->status : 'none';
            $u->is_sender = $friendship ? ($friendship->user_id == $currentUserId) : false;
            return $u;
        });

        return response()->json(['users' => $users]);
    }

    public function sendRequest(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'friend_id' => 'required|exists:users,id|different:' . $user->id,
        ]);

        $friendId = $validated['friend_id'];

        $existing = Friend::where(function($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)->where('friend_id', $friendId);
        })->orWhere(function($q) use ($user, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Friend request already exists or you are already friends.'], 400);
        }

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'status' => 'pending',
        ]);

        // Send notification to the target user
        UplyNotification::create([
            'user_id' => $friendId,
            'sender_id' => $user->id,
            'type' => 'friend_request',
            'title' => 'New Friend Request',
            'message' => "{$user->name} sent you a friend request.",
            'data' => ['friendship_id' => $friendship->id],
        ]);

        return response()->json(['friendship' => $friendship, 'message' => 'Friend request sent successfully!']);
    }

    public function respondRequest($id, Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'action' => 'required|in:accept,reject',
        ]);

        $friendship = Friend::where('id', $id)
            ->where(function($q) use ($user) {
                $q->where('friend_id', $user->id)->orWhere('user_id', $user->id);
            })->firstOrFail();

        if ($validated['action'] === 'accept') {
            $friendship->update(['status' => 'accepted']);
            $senderId = $friendship->user_id == $user->id ? $friendship->friend_id : $friendship->user_id;

            UplyNotification::create([
                'user_id' => $senderId,
                'sender_id' => $user->id,
                'type' => 'friend_request',
                'title' => 'Friend Request Accepted 🎉',
                'message' => "{$user->name} accepted your friend request!",
                'data' => ['friendship_id' => $friendship->id],
            ]);
        } else {
            $friendship->update(['status' => 'rejected']);
        }

        return response()->json(['friendship' => $friendship, 'message' => "Request {$validated['action']}ed!"]);
    }

    public function show($id, Request $request)
    {
        $friend = User::with(['goals', 'habits', 'achievements'])->findOrFail($id);

        return response()->json(['friend' => $friend]);
    }
}

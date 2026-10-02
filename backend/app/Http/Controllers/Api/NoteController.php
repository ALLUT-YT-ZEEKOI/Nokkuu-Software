<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notes = Note::where('user_id', $user->id)
            ->orderBy('is_pinned', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'notes' => $notes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category ?? 'General',
            'color' => $request->color ?? '#6366f1',
            'is_pinned' => $request->is_pinned ?? false,
        ]);

        return response()->json([
            'message' => 'Note saved to Tote Pad!',
            'note' => $note,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'is_pinned' => 'nullable|boolean',
        ]);

        $note->update($request->only(['title', 'content', 'category', 'color', 'is_pinned']));

        return response()->json([
            'message' => 'Note updated successfully!',
            'note' => $note,
        ]);
    }

    public function togglePin(Request $request, $id)
    {
        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $note->is_pinned = !$note->is_pinned;
        $note->save();

        return response()->json([
            'message' => $note->is_pinned ? 'Note pinned!' : 'Note unpinned!',
            'note' => $note,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully!'
        ]);
    }
}

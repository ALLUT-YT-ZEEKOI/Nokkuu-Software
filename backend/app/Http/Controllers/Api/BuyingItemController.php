<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BuyingItem;
use App\Models\Expense;
use Illuminate\Http\Request;

class BuyingItemController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $items = BuyingItem::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalEstimated = $items->where('status', '!=', 'purchased')->sum('estimated_price');

        return response()->json([
            'buying_items' => $items,
            'summary' => [
                'total_items' => $items->count(),
                'wishlist_count' => $items->where('status', 'wishlist')->count(),
                'planned_count' => $items->where('status', 'planned')->count(),
                'purchased_count' => $items->where('status', 'purchased')->count(),
                'total_estimated_budget' => $totalEstimated,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'estimated_price' => 'required|numeric|min:0',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
            'category' => 'nullable|string',
            'store_url' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $item = BuyingItem::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'estimated_price' => $request->estimated_price,
            'priority' => $request->priority ?? 'medium',
            'status' => $request->status ?? 'wishlist',
            'category' => $request->category ?? 'General',
            'store_url' => $request->store_url,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Buying item added to wishlist!',
            'buying_item' => $item,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = BuyingItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'estimated_price' => 'nullable|numeric|min:0',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
            'category' => 'nullable|string',
            'store_url' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $item->update($request->only(['title', 'estimated_price', 'priority', 'status', 'category', 'store_url', 'notes']));

        return response()->json([
            'message' => 'Buying item updated!',
            'buying_item' => $item,
        ]);
    }

    public function markPurchased(Request $request, $id)
    {
        $item = BuyingItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $item->status = 'purchased';
        $item->save();

        // Automatically log item into Expenses!
        $expense = Expense::create([
            'user_id' => $request->user()->id,
            'title' => 'Purchased: ' . $item->title,
            'amount' => $item->estimated_price,
            'category' => $item->category === 'Office' ? 'Office' : ($item->category === 'Personal' ? 'Personal' : 'Purchase'),
            'date' => now()->toDateString(),
            'notes' => 'Purchased from buying list planner: ' . ($item->notes ?? ''),
        ]);

        return response()->json([
            'message' => 'Item marked as purchased and logged in Expenses!',
            'buying_item' => $item,
            'expense' => $expense,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $item = BuyingItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $item->delete();

        return response()->json([
            'message' => 'Buying item removed!'
        ]);
    }
}

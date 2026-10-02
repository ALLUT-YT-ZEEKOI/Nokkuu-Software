<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Credit;
use App\Models\Expense;
use Illuminate\Http\Request;

class CreditController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $credits = Credit::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalCredits = $credits->sum('amount');
        $totalExpenses = Expense::where('user_id', $user->id)->sum('amount');
        $netBalance = $totalCredits - $totalExpenses;

        $byMethod = [
            'Cash' => $credits->where('payment_method', 'Cash')->sum('amount'),
            'UPI' => $credits->where('payment_method', 'UPI')->sum('amount'),
            'Bank Transfer' => $credits->where('payment_method', 'Bank Transfer')->sum('amount'),
            'Other' => $credits->whereNotIn('payment_method', ['Cash', 'UPI', 'Bank Transfer'])->sum('amount'),
        ];

        return response()->json([
            'credits' => $credits,
            'summary' => [
                'total_credits' => $totalCredits,
                'total_expenses' => $totalExpenses,
                'net_balance' => $netBalance,
                'by_method' => $byMethod,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'received_from' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'category' => 'nullable|string',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $credit = Credit::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'amount' => $request->amount,
            'received_from' => $request->received_from,
            'payment_method' => $request->payment_method ?? 'Cash',
            'category' => $request->category ?? 'Personal',
            'date' => $request->date ?? now()->toDateString(),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Cash/Credit entry logged successfully!',
            'credit' => $credit,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $credit = Credit::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $credit->delete();

        return response()->json([
            'message' => 'Credit entry deleted successfully!'
        ]);
    }
}

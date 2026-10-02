<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $expenses = Expense::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalAmount = $expenses->sum('amount');
        $byCategory = [
            'Office' => $expenses->where('category', 'Office')->sum('amount'),
            'Personal' => $expenses->where('category', 'Personal')->sum('amount'),
            'Purchase' => $expenses->where('category', 'Purchase')->sum('amount'),
            'Other' => $expenses->where('category', 'Other')->sum('amount'),
        ];

        return response()->json([
            'expenses' => $expenses,
            'summary' => [
                'total' => $totalAmount,
                'by_category' => $byCategory,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $expense = Expense::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'amount' => $request->amount,
            'category' => $request->category,
            'date' => $request->date ?? now()->toDateString(),
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Expense logged successfully!',
            'expense' => $expense,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $expense = Expense::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $expense->delete();

        return response()->json([
            'message' => 'Expense deleted successfully!'
        ]);
    }
}

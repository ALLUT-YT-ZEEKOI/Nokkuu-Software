import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Set customLiveApiUrl to your hosted free backend URL (e.g. 'https://nokkuu-software.onrender.com/api')
  static String? customLiveApiUrl = 'https://nokkuu-software.onrender.com/api';

  static String get baseUrl {
    if (customLiveApiUrl != null && customLiveApiUrl!.trim().isNotEmpty) {
      final url = customLiveApiUrl!.trim();
      return url.endsWith('/api') ? url : '$url/api';
    }
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000/api';
    } else {
      return 'http://127.0.0.1:8000/api';
    }
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('uply_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('uply_token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('uply_token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: await _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 200 && data['token'] != null) {
      await saveToken(data['token']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: await _headers(),
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 201 && data['token'] != null) {
      await saveToken(data['token']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> getProfile() async {
    final res = await http.get(Uri.parse('$baseUrl/profile'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Dashboard
  static Future<Map<String, dynamic>> getDashboard() async {
    final res = await http.get(Uri.parse('$baseUrl/dashboard'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Goals
  static Future<Map<String, dynamic>> getGoals() async {
    final res = await http.get(Uri.parse('$baseUrl/goals'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> createGoal(Map<String, dynamic> goalData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/goals'),
      headers: await _headers(),
      body: jsonEncode(goalData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> toggleMilestone(int goalId, int milestoneId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/goals/$goalId/milestones/$milestoneId/toggle'),
      headers: await _headers(),
    );
    return jsonDecode(res.body);
  }

  // Tasks
  static Future<Map<String, dynamic>> getTasks() async {
    final res = await http.get(Uri.parse('$baseUrl/tasks'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> getAssignedTasksHub() async {
    final res = await http.get(Uri.parse('$baseUrl/assigned-tasks'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> createTask(Map<String, dynamic> taskData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/tasks'),
      headers: await _headers(),
      body: jsonEncode(taskData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> updateTaskStatus(int taskId, String status) async {
    final res = await http.put(
      Uri.parse('$baseUrl/tasks/$taskId/status'),
      headers: await _headers(),
      body: jsonEncode({'status': status}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> deleteTask(int taskId) async {
    final res = await http.delete(Uri.parse('$baseUrl/tasks/$taskId'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Expenses
  static Future<Map<String, dynamic>> getExpenses() async {
    final res = await http.get(Uri.parse('$baseUrl/expenses'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> createExpense(Map<String, dynamic> expenseData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/expenses'),
      headers: await _headers(),
      body: jsonEncode(expenseData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> deleteExpense(int id) async {
    final res = await http.delete(Uri.parse('$baseUrl/expenses/$id'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Cash Credits / Income
  static Future<Map<String, dynamic>> getCredits() async {
    final res = await http.get(Uri.parse('$baseUrl/credits'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> createCredit(Map<String, dynamic> creditData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/credits'),
      headers: await _headers(),
      body: jsonEncode(creditData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> deleteCredit(int id) async {
    final res = await http.delete(Uri.parse('$baseUrl/credits/$id'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Buying Items / Ambitions
  static Future<Map<String, dynamic>> getBuyingItems() async {
    final res = await http.get(Uri.parse('$baseUrl/buying-items'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> createBuyingItem(Map<String, dynamic> itemData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/buying-items'),
      headers: await _headers(),
      body: jsonEncode(itemData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> markBuyingItemPurchased(int id) async {
    final res = await http.post(Uri.parse('$baseUrl/buying-items/$id/buy'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> deleteBuyingItem(int id) async {
    final res = await http.delete(Uri.parse('$baseUrl/buying-items/$id'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Tote Pad Notes
  static Future<Map<String, dynamic>> getNotes() async {
    final res = await http.get(Uri.parse('$baseUrl/notes'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> createNote(Map<String, dynamic> noteData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/notes'),
      headers: await _headers(),
      body: jsonEncode(noteData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> updateNote(int id, Map<String, dynamic> noteData) async {
    final res = await http.put(
      Uri.parse('$baseUrl/notes/$id'),
      headers: await _headers(),
      body: jsonEncode(noteData),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> toggleNotePin(int id) async {
    final res = await http.post(Uri.parse('$baseUrl/notes/$id/pin'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> deleteNote(int id) async {
    final res = await http.delete(Uri.parse('$baseUrl/notes/$id'), headers: await _headers());
    return jsonDecode(res.body);
  }

  // Habits
  static Future<Map<String, dynamic>> getHabits() async {
    final res = await http.get(Uri.parse('$baseUrl/habits'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> toggleHabit(int habitId, {String? date}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/habits/$habitId/toggle'),
      headers: await _headers(),
      body: jsonEncode({if (date != null) 'date': date}),
    );
    return jsonDecode(res.body);
  }

  // Friends
  static Future<Map<String, dynamic>> getFriends() async {
    final res = await http.get(Uri.parse('$baseUrl/friends'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> searchFriends(String query) async {
    final res = await http.get(Uri.parse('$baseUrl/friends/search?query=$query'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> sendFriendRequest(int friendId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/friends/request'),
      headers: await _headers(),
      body: jsonEncode({'friend_id': friendId}),
    );
    return jsonDecode(res.body);
  }

  // Challenges
  static Future<Map<String, dynamic>> getChallenges() async {
    final res = await http.get(Uri.parse('$baseUrl/challenges'), headers: await _headers());
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> joinChallenge(int challengeId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/challenges/$challengeId/join'),
      headers: await _headers(),
    );
    return jsonDecode(res.body);
  }

  // Achievements
  static Future<Map<String, dynamic>> getAchievements() async {
    final res = await http.get(Uri.parse('$baseUrl/achievements'), headers: await _headers());
    return jsonDecode(res.body);
  }
}

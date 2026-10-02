import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  const LoginScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isLoading = false;
  bool _isRegisterMode = false;
  String? _errorMessage;

  Future<void> _handleAuth([String? email, String? password]) async {
    final reqEmail = email ?? _emailController.text.trim();
    final reqPass = password ?? _passwordController.text.trim();
    final reqName = _nameController.text.trim();

    if (_isRegisterMode && reqName.isEmpty) {
      setState(() => _errorMessage = 'Please enter your full name');
      return;
    }

    if (reqEmail.isEmpty || reqPass.isEmpty) {
      setState(() => _errorMessage = 'Please enter email & password');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = _isRegisterMode
          ? await ApiService.register(reqName, reqEmail, reqPass)
          : await ApiService.login(reqEmail, reqPass);

      if (data['token'] != null) {
        widget.onLoginSuccess();
      } else {
        setState(() => _errorMessage = data['message'] ?? 'Authentication failed');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Connection error: ${e.toString()}');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Mesh Glow Spheres
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accentPink.withValues(alpha: 0.25),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentPink.withValues(alpha: 0.4),
                    blurRadius: 100,
                    spreadRadius: 40,
                  )
                ],
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryIndigo.withValues(alpha: 0.3),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryIndigo.withValues(alpha: 0.45),
                    blurRadius: 120,
                    spreadRadius: 50,
                  )
                ],
              ),
            ),
          ),
          Positioned(
            top: MediaQuery.of(context).size.height * 0.4,
            left: MediaQuery.of(context).size.width * 0.3,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accentCyan.withValues(alpha: 0.15),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentCyan.withValues(alpha: 0.25),
                    blurRadius: 90,
                    spreadRadius: 30,
                  )
                ],
              ),
            ),
          ),

          // Main Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Glassmorphic Card Container
                    Container(
                      constraints: const BoxConstraints(maxWidth: 440),
                      padding: const EdgeInsets.all(28.0),
                      decoration: AppTheme.glassCardDecoration(
                        borderColor: Colors.white.withValues(alpha: 0.15),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Brand Header & Malayalam Badge
                          Center(
                            child: Column(
                              children: [
                                Container(
                                  width: 68,
                                  height: 68,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [AppTheme.primaryIndigo, AppTheme.accentPurple, AppTheme.accentPink],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(22),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppTheme.primaryIndigo.withValues(alpha: 0.5),
                                        blurRadius: 20,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 36),
                                ),
                                const SizedBox(height: 14),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Text(
                                      'NOKKUU',
                                      style: TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 2.0,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            AppTheme.accentCyan.withValues(alpha: 0.25),
                                            AppTheme.primaryIndigo.withValues(alpha: 0.25),
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.5)),
                                      ),
                                      child: const Text(
                                        'നോക്കൂ',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.accentCyan,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _isRegisterMode
                                      ? 'Create your account to start your growth journey'
                                      : 'Build goals • Build habits • Help friends grow',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.7),
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Segmented Tab Switcher (Sign In vs Register)
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0B1120),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() {
                                      _isRegisterMode = false;
                                      _errorMessage = null;
                                    }),
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(
                                        color: !_isRegisterMode ? AppTheme.primaryIndigo : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Sign In',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: !_isRegisterMode ? Colors.white : Colors.white60,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() {
                                      _isRegisterMode = true;
                                      _errorMessage = null;
                                    }),
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(
                                        color: _isRegisterMode ? AppTheme.primaryIndigo : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Register',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: _isRegisterMode ? Colors.white : Colors.white60,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Error Alert
                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF43F5E).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.error_outline_rounded, color: Color(0xFFF43F5E), size: 20),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      _errorMessage!,
                                      style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 18),
                          ],

                          // Form Inputs
                          if (_isRegisterMode) ...[
                            _buildInputField(
                              controller: _nameController,
                              label: 'Full Name',
                              icon: Icons.person_outline_rounded,
                            ),
                            const SizedBox(height: 14),
                          ],

                          _buildInputField(
                            controller: _emailController,
                            label: 'Email Address',
                            icon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                          ),
                          const SizedBox(height: 14),

                          _buildInputField(
                            controller: _passwordController,
                            label: 'Password',
                            icon: Icons.lock_outline_rounded,
                            obscureText: true,
                          ),
                          const SizedBox(height: 22),

                          // Submit Button
                          Container(
                            height: 52,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [AppTheme.primaryIndigo, AppTheme.accentPurple, AppTheme.accentPink],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryIndigo.withValues(alpha: 0.4),
                                  blurRadius: 16,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : () => _handleAuth(),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                                    )
                                  : Text(
                                      _isRegisterMode ? 'Create Account 🚀' : 'Sign In to Dashboard',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 15,
                                        color: Colors.white,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                            ),
                          ),

                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.12))),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Text(
                                  'INSTANT DEMO LOGIN',
                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                              Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.12))),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // 1-Click Demo Profiles Chips Bar
                          Row(
                            children: [
                              Expanded(
                                child: _demoUserChip(
                                  name: 'Ameen',
                                  role: 'Pro',
                                  avatarColor: AppTheme.primaryIndigo,
                                  onTap: () => _handleAuth('ameen@gmail.com', 'ameen@gmail.com'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _demoUserChip(
                                  name: 'Rahul',
                                  role: 'Dev',
                                  avatarColor: AppTheme.accentPurple,
                                  onTap: () => _handleAuth('rahul@uply.io', 'password123'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _demoUserChip(
                                  name: 'Sarah',
                                  role: 'Lead',
                                  avatarColor: AppTheme.accentPink,
                                  onTap: () => _handleAuth('sarah@uply.io', 'password123'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0B1120),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 13),
          prefixIcon: Icon(icon, color: AppTheme.primaryIndigo, size: 22),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: InputBorder.none,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: AppTheme.primaryIndigo.withValues(alpha: 0.8), width: 1.5),
          ),
        ),
      ),
    );
  }

  Widget _demoUserChip({
    required String name,
    required String role,
    required Color avatarColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF0B1120),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: avatarColor.withValues(alpha: 0.4), width: 1.2),
        ),
        child: Column(
          children: [
            CircleAvatar(
              radius: 14,
              backgroundColor: avatarColor.withValues(alpha: 0.25),
              child: Text(
                name[0],
                style: TextStyle(color: avatarColor, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              name,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            ),
            Text(
              role,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 9, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color bgMain = Color(0xFF090D16);
  static const Color bgCard = Color(0xCC0F172A);
  static const Color primaryIndigo = Color(0xFF6366F1);
  static const Color accentPurple = Color(0xFF8B5CF6);
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color accentPink = Color(0xFFEC4899);
  static const Color accentCyan = Color(0xFF06B6D4);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: bgMain,
      primaryColor: primaryIndigo,
      colorScheme: const ColorScheme.dark(
        primary: primaryIndigo,
        secondary: accentPurple,
        surface: bgCard,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: bgCard,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Colors.white10),
        ),
      ),
    );
  }

  static BoxDecoration glassCardDecoration({Color? borderColor, List<BoxShadow>? shadows}) {
    return BoxDecoration(
      color: const Color(0xF20F172A),
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: borderColor ?? Colors.white.withValues(alpha: 0.12), width: 1.2),
      boxShadow: shadows ??
          [
            BoxShadow(
              color: primaryIndigo.withValues(alpha: 0.15),
              blurRadius: 24,
              offset: const Offset(0, 10),
            ),
            const BoxShadow(
              color: Colors.black45,
              blurRadius: 30,
              offset: Offset(0, 16),
            ),
          ],
    );
  }
}

import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';

class GaragePlaceholderScreen extends StatelessWidget {
  const GaragePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Garage')),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Text(
          'Garage data comes from the same Carasta profile APIs as the website. Wiring is Phase 2+.',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        ),
      ),
    );
  }
}

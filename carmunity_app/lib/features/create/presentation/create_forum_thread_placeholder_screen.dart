import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';

/// Forums creation is staged — no mobile-safe forum thread API in this repo yet.
class CreateForumThreadPlaceholderScreen extends StatelessWidget {
  const CreateForumThreadPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Forum thread')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Icon(Icons.forum_outlined, size: 48, color: AppColors.accent.withValues(alpha: 0.8)),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Forum threads on the web',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Creating threads from Carmunity will use the same Carasta rules as the website once a '
            'JSON forum API exists. This screen is intentionally staged so we do not fake data or '
            'duplicate business logic in the client.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Next step (Phase 4+): align on forum routes + request bodies, then wire this entry point.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

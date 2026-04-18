import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';

/// Dedicated media hub — staged (post composer has real photo upload; see CARASTA_APP_PHASE_5_NOTES.md).
class CreateMediaPlaceholderScreen extends StatelessWidget {
  const CreateMediaPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Media upload')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Icon(Icons.cloud_upload_outlined, size: 48, color: AppColors.accent.withValues(alpha: 0.8)),
          const SizedBox(height: AppSpacing.md),
          Text(
            'This hub is still staged',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Create → Post: gallery photos upload via Carasta (`POST /api/carmunity/media/upload`) and attach to your post. '
            'This screen is for a future multi-asset / video flow — not wired yet.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'See CARASTA_APP_PHASE_5_NOTES.md and CARMUNITY_MEDIA_UPLOAD_CONTRACT.md.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

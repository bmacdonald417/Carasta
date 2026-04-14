import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/utils/responsive_layout.dart';

/// Dedicated media hub — staged until upload/presign + storage policy land on Carasta.
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
            'Upload pipeline is staged',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'The post composer already supports public image URLs and local gallery previews. '
            'Binary uploads require a server-issued destination (presigned URL or authenticated upload) '
            'so the app never pretends a file reached Carasta storage.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'See CARASTA_APP_PHASE_3_NOTES.md for the recommended backend contract and Phase 4 scope.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

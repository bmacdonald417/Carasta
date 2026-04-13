import 'package:flutter/material.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';

class ForumCategoryPlaceholderScreen extends StatelessWidget {
  const ForumCategoryPlaceholderScreen({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_titleForSlug(slug))),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Threads will appear here',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Category: $slug',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Backend forum models and list APIs are not in Phase 1. This screen reserves routing and layout.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  String _titleForSlug(String s) {
    switch (s) {
      case 'mechanics':
        return 'Mechanics Corner';
      case 'gear':
        return 'Gear Interests';
      default:
        return 'Forum';
    }
  }
}

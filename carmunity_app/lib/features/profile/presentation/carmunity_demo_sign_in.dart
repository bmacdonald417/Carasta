import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/config/app_config.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/dto/demo_account_dto.dart';
import '../../../shared/state/providers.dart';

/// Local development: mint a NextAuth session for a seeded seller and apply it in-memory.
Future<void> showCarmunityDemoSignInSheet(BuildContext context, WidgetRef ref) async {
  final messenger = ScaffoldMessenger.maybeOf(context);
  final accounts = await ref.read(carmunityRepositoryProvider).fetchDemoAccounts();
  if (!context.mounted) return;

  if (accounts.isEmpty) {
    messenger?.showSnackBar(
      const SnackBar(
        content: Text(
          'No demo accounts found. Run Next.js in development (npm run dev) and prisma db seed.',
        ),
      ),
    );
    return;
  }

  int score(DemoAccountDto u) => u.postsCount * 10 + u.listingsCount;
  accounts.sort((a, b) => score(b).compareTo(score(a)));

  await showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (ctx) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
                child: Text(
                  'Demo seller',
                  style: Theme.of(ctx).textTheme.titleMedium,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Text(
                  'Uses the dev-only API on your Carasta server. Password for web login is still password123.',
                  style: Theme.of(ctx).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: accounts.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, i) {
                    final a = accounts[i];
                    return ListTile(
                      title: Text(a.label),
                      subtitle: Text(a.subtitle),
                      trailing: const Icon(Icons.login_rounded, color: AppColors.accent),
                      onTap: () async {
                        Navigator.of(context).pop();
                        await _applyDemoAccount(context, ref, a);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

Future<void> _applyDemoAccount(BuildContext context, WidgetRef ref, DemoAccountDto a) async {
  final messenger = ScaffoldMessenger.maybeOf(context);
  try {
    final minted = await ref.read(carmunityRepositoryProvider).mintDemoSession(email: a.email);
    ref.read(authServiceProvider).signInWithAccessToken(
          accessToken: minted.sessionToken,
          userId: minted.userId,
        );
    ref.invalidate(carmunityMeProvider);
    ref.invalidate(homeFeedProvider);
    ref.invalidate(carmunityDemoAccountsProvider);
    ref.invalidate(auctionWatchedIdsProvider);
    ref.invalidate(auctionWatchlistProvider);
    messenger?.showSnackBar(
      SnackBar(content: Text('Signed in as @${a.handle}')),
    );
  } on ApiException catch (e) {
    messenger?.showSnackBar(
      SnackBar(content: Text(e.message)),
    );
  } catch (e) {
    messenger?.showSnackBar(
      SnackBar(content: Text('Demo sign-in failed: $e')),
    );
  }
}

bool showCarmunityDemoSignInUi() => !AppConfig.instance.isProduction;

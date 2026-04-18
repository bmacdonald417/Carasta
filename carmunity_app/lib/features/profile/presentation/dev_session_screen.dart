import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../../shared/state/providers.dart';
import 'carmunity_demo_sign_in.dart';

/// Developer / QA auth — **not** a production sign-in UI.
///
/// Phase 7: prefer **Bearer JWT** via email/password (`POST /api/auth/mobile/token`) or paste the
/// same JWT string the web stores in `next-auth.session-token`. Cookie mode remains for legacy tests.
class DevSessionScreen extends ConsumerStatefulWidget {
  const DevSessionScreen({super.key});

  @override
  ConsumerState<DevSessionScreen> createState() => _DevSessionScreenState();
}

class _DevSessionScreenState extends ConsumerState<DevSessionScreen> {
  late final TextEditingController _userIdCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _passwordCtrl;
  late final TextEditingController _jwtCtrl;
  late final TextEditingController _cookieNameCtrl;
  late final TextEditingController _cookieValueCtrl;
  bool _exchanging = false;

  @override
  void initState() {
    super.initState();
    _userIdCtrl = TextEditingController();
    _emailCtrl = TextEditingController();
    _passwordCtrl = TextEditingController();
    _jwtCtrl = TextEditingController();
    _cookieNameCtrl = TextEditingController(text: 'next-auth.session-token');
    _cookieValueCtrl = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = ref.read(authServiceProvider);
      _userIdCtrl.text = auth.userId ?? '';
    });
  }

  @override
  void dispose() {
    _userIdCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _jwtCtrl.dispose();
    _cookieNameCtrl.dispose();
    _cookieValueCtrl.dispose();
    super.dispose();
  }

  void _invalidateSessionConsumers() {
    ref.invalidate(carmunityMeProvider);
    ref.invalidate(homeFeedProvider);
    ref.invalidate(auctionWatchedIdsProvider);
    ref.invalidate(auctionWatchlistProvider);
  }

  @override
  Widget build(BuildContext context) {
    final h = pageHorizontalPadding(context);
    final auth = ref.watch(authServiceProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Developer session')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.lg, h, AppSpacing.xxl),
        children: [
          Text(
            'Mobile auth bridge',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Use email + password for a real Bearer JWT, paste a JWT + user id, or fall back to cookie headers. '
            'All values stay in memory only.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('Email sign-in → Bearer', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Uses POST /api/auth/mobile/token (credentials accounts only — not Google-only users).',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _passwordCtrl,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Password',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton.tonal(
            onPressed: _exchanging
                ? null
                : () async {
                    final messenger = ScaffoldMessenger.of(context);
                    setState(() => _exchanging = true);
                    try {
                      final out = await ref.read(carmunityAuthRepositoryProvider).exchangeMobileToken(
                            email: _emailCtrl.text,
                            password: _passwordCtrl.text,
                          );
                      ref.read(authServiceProvider).signInWithAccessToken(
                            accessToken: out.accessToken,
                            userId: out.userId,
                          );
                      _userIdCtrl.text = out.userId;
                      _invalidateSessionConsumers();
                      if (!mounted) return;
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Signed in with Bearer JWT (memory only).')),
                      );
                    } on ApiException catch (e) {
                      if (!mounted) return;
                      messenger.showSnackBar(SnackBar(content: Text(e.message)));
                    } finally {
                      if (mounted) setState(() => _exchanging = false);
                    }
                  },
            child: _exchanging
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Exchange for Bearer'),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('Paste JWT + user id', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _userIdCtrl,
            decoration: const InputDecoration(
              labelText: 'User id',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _jwtCtrl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'JWT (same as session cookie value)',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          OutlinedButton(
            onPressed: () {
              ref.read(authServiceProvider).applyBearerJwtAndUserId(
                    jwt: _jwtCtrl.text,
                    userId: _userIdCtrl.text,
                  );
              _invalidateSessionConsumers();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Bearer JWT applied.')),
              );
            },
            child: const Text('Apply JWT as Bearer'),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('Cookie (legacy)', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _cookieNameCtrl,
            decoration: const InputDecoration(
              labelText: 'Cookie name',
              hintText: 'next-auth.session-token',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _cookieValueCtrl,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Cookie value',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Status: ${auth.canPerformMutations ? "cookie or bearer set" : "no mutation session"} · '
            'user id: ${auth.hasUserId ? "set" : "missing"}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton(
            onPressed: () {
              ref.read(authServiceProvider).applyDevSessionFields(
                    userIdInput: _userIdCtrl.text,
                    cookieName: _cookieNameCtrl.text,
                    cookieValueInput: _cookieValueCtrl.text,
                  );
              _invalidateSessionConsumers();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cookie session applied (memory only).')),
              );
            },
            child: const Text('Apply cookie session'),
          ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton(
            onPressed: () {
              ref.read(authServiceProvider).clearSession();
              _cookieValueCtrl.clear();
              _jwtCtrl.clear();
              _passwordCtrl.clear();
              _invalidateSessionConsumers();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cleared in-app session.')),
              );
            },
            child: const Text('Clear in-app session'),
          ),
          if (showCarmunityDemoSignInUi()) ...[
            const SizedBox(height: AppSpacing.xl),
            Text(
              'Or pick a seeded seller',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: AppSpacing.sm),
            OutlinedButton.icon(
              onPressed: () => showCarmunityDemoSignInSheet(context, ref),
              icon: const Icon(Icons.people_outline),
              label: const Text('Demo seller list'),
            ),
          ],
        ],
      ),
    );
  }
}

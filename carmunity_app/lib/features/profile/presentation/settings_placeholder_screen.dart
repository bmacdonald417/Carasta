import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/state/providers.dart';

/// Carmunity preferences — mirrors web onboarding PATCH (`/api/user/carmunity-onboarding`).
class SettingsPlaceholderScreen extends ConsumerStatefulWidget {
  const SettingsPlaceholderScreen({super.key});

  @override
  ConsumerState<SettingsPlaceholderScreen> createState() => _SettingsPlaceholderScreenState();
}

class _SettingsPlaceholderScreenState extends ConsumerState<SettingsPlaceholderScreen> {
  final _gearController = TextEditingController();
  bool _loading = true;
  bool _saving = false;
  bool _completed = false;
  Map<String, dynamic>? _prefs;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _gearController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      setState(() {
        _loading = false;
        _error = null;
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final st = await ref.read(carmunityRepositoryProvider).fetchCarmunityOnboarding();
      final gear = st.prefs?['gearSlugs'];
      if (gear is List) {
        _gearController.text = gear.whereType<String>().join(', ');
      }
      if (!mounted) return;
      setState(() {
        _completed = st.completed;
        _prefs = st.prefs;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : e.toString();
      });
    }
  }

  Future<void> _saveGears() async {
    final slugs = _gearController.text
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
    setState(() => _saving = true);
    try {
      final st = await ref.read(carmunityRepositoryProvider).patchCarmunityOnboarding({
        'gearSlugs': slugs,
      });
      if (!mounted) return;
      setState(() {
        _completed = st.completed;
        _prefs = st.prefs;
        _saving = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preferences saved')));
      ref.invalidate(carmunityMeProvider);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : 'Save failed')),
      );
    }
  }

  Future<void> _resetOnboarding() async {
    setState(() => _saving = true);
    try {
      final st = await ref.read(carmunityRepositoryProvider).patchCarmunityOnboarding({
        'resetOnboarding': true,
      });
      if (!mounted) return;
      setState(() {
        _completed = st.completed;
        _prefs = st.prefs;
        _saving = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Onboarding reset — complete it again on web or here after prefs.')),
      );
      ref.invalidate(carmunityMeProvider);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : 'Reset failed')),
      );
    }
  }

  Future<void> _markComplete() async {
    setState(() => _saving = true);
    try {
      final st = await ref.read(carmunityRepositoryProvider).patchCarmunityOnboarding({
        'complete': true,
      });
      if (!mounted) return;
      setState(() {
        _completed = st.completed;
        _prefs = st.prefs;
        _saving = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Marked onboarding complete')));
      ref.invalidate(carmunityMeProvider);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : 'Update failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authServiceProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Carmunity settings')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            'These controls hit the same `/api/user/carmunity-onboarding` contract as Carasta web (Gears / Lower gears / completion).',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (!auth.canPerformMutations)
            Text(
              'Sign in (Bearer JWT or Developer session) to edit preferences.',
              style: Theme.of(context).textTheme.bodyMedium,
            )
          else if (_loading)
            const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
          else ...[
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Onboarding completed'),
              subtitle: Text(_completed ? 'Yes' : 'No'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _gearController,
              decoration: const InputDecoration(
                labelText: 'Gear slugs (comma-separated)',
                hintText: 'e.g. porsche, track-day',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            FilledButton(
              onPressed: _saving ? null : _saveGears,
              child: Text(_saving ? 'Saving…' : 'Save gears'),
            ),
            const SizedBox(height: AppSpacing.sm),
            OutlinedButton(
              onPressed: _saving ? null : _markComplete,
              child: const Text('Mark onboarding complete'),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton(
              onPressed: _saving ? null : _resetOnboarding,
              child: const Text('Reset onboarding (revisit)'),
            ),
            if (_prefs != null) ...[
              const SizedBox(height: AppSpacing.lg),
              Text('Raw prefs', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: AppSpacing.sm),
              SelectableText(
                _prefs.toString(),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textTertiary),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

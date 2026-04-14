import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/media/carmunity_upload_result.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/responsive_layout.dart';
import '../../home/presentation/widgets/sign_in_required_hint.dart';
import '../../../shared/state/providers.dart';

/// Standard post composer — `POST /api/carmunity/posts` with text and/or `imageUrl`.
class CreatePostScreen extends ConsumerStatefulWidget {
  const CreatePostScreen({super.key});

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final _contentCtrl = TextEditingController();
  final _imageUrlCtrl = TextEditingController();
  Uint8List? _pickedPreview;
  String? _pickedName;
  String? _pickedMime;
  bool _submitting = false;

  @override
  void dispose() {
    _contentCtrl.dispose();
    _imageUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ref.read(mediaPickerServiceProvider);
    final file = await picker.pickGalleryImage();
    if (file == null || !mounted) return;
    final bytes = await file.readAsBytes();
    setState(() {
      _pickedPreview = bytes;
      _pickedName = file.name;
      _pickedMime = _guessMime(file.name);
    });
  }

  String _guessMime(String name) {
    final lower = name.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  }

  void _clearPick() {
    setState(() {
      _pickedPreview = null;
      _pickedName = null;
      _pickedMime = null;
    });
  }

  Future<void> _submit() async {
    final auth = ref.read(authServiceProvider);
    if (!auth.canPerformMutations) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in required. Use Developer session on the You tab.')),
      );
      return;
    }

    final text = _contentCtrl.text.trim();
    var imageUrlOut = _imageUrlCtrl.text.trim();

    if (_pickedPreview != null && imageUrlOut.isEmpty) {
      final upload = ref.read(carmunityMediaUploadPortProvider);
      final name = _pickedName ?? 'image.jpg';
      final mime = _pickedMime ?? 'image/jpeg';
      final result = await upload.uploadPostImage(
        bytes: _pickedPreview!.toList(),
        filename: name,
        mimeType: mime,
      );
      if (result is CarmunityUploadUnavailable) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result.message)));
        return;
      }
      if (result is CarmunityUploadSuccess) {
        imageUrlOut = result.imageUrl;
      }
    }

    if (!mounted) return;

    if (text.isEmpty && imageUrlOut.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add text, an image URL, or clear the photo and try again.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final id = await ref.read(carmunityRepositoryProvider).createPost(
            content: text.isEmpty ? null : text,
            imageUrl: imageUrlOut.isEmpty ? null : imageUrlOut,
          );
      ref.invalidate(homeFeedProvider);
      ref.invalidate(carmunityMeProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Post published')),
      );
      context.go(AppRoutes.postDetail(id));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authServiceProvider);
    final h = pageHorizontalPadding(context);
    final canPost = auth.canPerformMutations && !_submitting;

    return Scaffold(
      appBar: AppBar(
        title: const Text('New post'),
        actions: [
          TextButton(
            onPressed: canPost ? _submit : null,
            child: _submitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Post'),
          ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(h, AppSpacing.md, h, AppSpacing.xxl),
        children: [
          if (!auth.canPerformMutations) const SignInRequiredHint(),
          TextField(
            controller: _contentCtrl,
            minLines: 5,
            maxLines: 12,
            decoration: const InputDecoration(
              labelText: 'What is on your mind?',
              alignLabelWithHint: true,
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Photo',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Paste a public image URL (recommended today). Gallery pick previews locally; '
            'binary upload waits on a Carasta upload API.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _imageUrlCtrl,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(
              labelText: 'Image URL (https://…)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: _submitting ? null : _pickImage,
                icon: const Icon(Icons.photo_outlined),
                label: const Text('Choose from gallery'),
              ),
              if (_pickedPreview != null) ...[
                const SizedBox(width: AppSpacing.sm),
                TextButton(onPressed: _submitting ? null : _clearPick, child: const Text('Clear photo')),
              ],
            ],
          ),
          if (_pickedPreview != null) ...[
            const SizedBox(height: AppSpacing.md),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.memory(
                  _pickedPreview!,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          FilledButton(
            onPressed: canPost ? _submit : null,
            child: _submitting
                ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                  )
                : const Text('Publish'),
          ),
        ],
      ),
    );
  }
}

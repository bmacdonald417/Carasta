import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auctions/presentation/auction_detail_screen.dart';
import '../../features/auctions/presentation/auctions_screen.dart';
import '../../features/auctions/presentation/saved_auctions_screen.dart';
import '../../features/create/presentation/create_forum_thread_screen.dart';
import '../../features/create/presentation/create_hub_screen.dart';
import '../../features/create/presentation/create_media_placeholder_screen.dart';
import '../../features/create/presentation/create_post_screen.dart';
import '../../features/create/presentation/share_link_post_screen.dart';
import '../../features/forums/presentation/forum_category_threads_screen.dart';
import '../../features/forums/presentation/forum_space_screen.dart';
import '../../features/forums/presentation/forum_thread_detail_screen.dart';
import '../../features/forums/presentation/forums_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/home/presentation/post_detail_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/profile/presentation/dev_session_screen.dart';
import '../../features/profile/presentation/garage_placeholder_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/settings_placeholder_screen.dart';
import '../widgets/app_shell.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final goRouterProvider = Provider<GoRouter>((ref) {
  final router = createAppRouter();
  ref.onDispose(router.dispose);
  return router;
});

/// Application router — shell + nested routes + future deep-link aliases.
GoRouter createAppRouter() {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/home',
    redirect: (context, state) {
      if (state.uri.path == '/') {
        return '/home';
      }
      return null;
    },
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
                routes: [
                  GoRoute(
                    path: 'post/:id',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return PostDetailScreen(postId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/forums',
                builder: (context, state) => const ForumsScreen(),
                routes: [
                  GoRoute(
                    path: 'space/:spaceSlug',
                    builder: (context, state) {
                      final slug = state.pathParameters['spaceSlug']!;
                      return ForumSpaceScreen(spaceSlug: slug);
                    },
                  ),
                  GoRoute(
                    path: 'category/:categoryId',
                    builder: (context, state) {
                      final id = state.pathParameters['categoryId']!;
                      return ForumCategoryThreadsScreen(categoryId: id);
                    },
                  ),
                  GoRoute(
                    path: 'thread/:threadId',
                    builder: (context, state) {
                      final id = state.pathParameters['threadId']!;
                      return ForumThreadDetailScreen(threadId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/create',
                builder: (context, state) => const CreateHubScreen(),
                routes: [
                  GoRoute(
                    path: 'post',
                    builder: (context, state) => const CreatePostScreen(),
                  ),
                  GoRoute(
                    path: 'share-link',
                    builder: (context, state) => const ShareLinkPostScreen(),
                  ),
                  GoRoute(
                    path: 'forum-thread',
                    builder: (context, state) => const CreateForumThreadScreen(),
                  ),
                  GoRoute(
                    path: 'media',
                    builder: (context, state) => const CreateMediaPlaceholderScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/auctions',
                builder: (context, state) => const AuctionsScreen(),
                routes: [
                  GoRoute(
                    path: 'detail/:auctionId',
                    builder: (context, state) {
                      final id = state.pathParameters['auctionId']!;
                      return AuctionDetailScreen(auctionId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/you',
                builder: (context, state) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'notifications',
                    builder: (context, state) => const NotificationsScreen(),
                  ),
                  GoRoute(
                    path: 'garage',
                    builder: (context, state) => const GaragePlaceholderScreen(),
                  ),
                  GoRoute(
                    path: 'saved-auctions',
                    builder: (context, state) => const SavedAuctionsScreen(),
                  ),
                  GoRoute(
                    path: 'settings',
                    builder: (context, state) => const SettingsPlaceholderScreen(),
                  ),
                  GoRoute(
                    path: 'dev-session',
                    builder: (context, state) => const DevSessionScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      /// Deep-link shape: `carasta://post/:id` → map host `post` + id in platform config; path target:
      GoRoute(
        path: '/post/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return PostDetailScreen(postId: id);
        },
      ),
      GoRoute(
        path: '/auction/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AuctionDetailScreen(auctionId: id);
        },
      ),
    ],
  );
}

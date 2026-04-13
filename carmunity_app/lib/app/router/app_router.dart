import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auctions/presentation/auction_detail_placeholder_screen.dart';
import '../../features/auctions/presentation/auctions_screen.dart';
import '../../features/create/presentation/create_screen.dart';
import '../../features/forums/presentation/forum_category_placeholder_screen.dart';
import '../../features/forums/presentation/forum_thread_placeholder_screen.dart';
import '../../features/forums/presentation/forums_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/home/presentation/post_detail_placeholder_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
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
                      return PostDetailPlaceholderScreen(postId: id);
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
                    path: 'c/:slug',
                    builder: (context, state) {
                      final slug = state.pathParameters['slug']!;
                      return ForumCategoryPlaceholderScreen(slug: slug);
                    },
                  ),
                  GoRoute(
                    path: 'thread/:threadId',
                    builder: (context, state) {
                      final id = state.pathParameters['threadId']!;
                      return ForumThreadPlaceholderScreen(threadId: id);
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
                builder: (context, state) => const CreateScreen(),
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
                      return AuctionDetailPlaceholderScreen(auctionId: id);
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
                    path: 'settings',
                    builder: (context, state) => const SettingsPlaceholderScreen(),
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
          return PostDetailPlaceholderScreen(postId: id);
        },
      ),
      GoRoute(
        path: '/auction/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return AuctionDetailPlaceholderScreen(auctionId: id);
        },
      ),
    ],
  );
}

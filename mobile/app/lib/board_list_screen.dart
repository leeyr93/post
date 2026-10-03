import 'package:flutter/material.dart';
import 'api_client.dart';
import 'board_view_screen.dart';
import 'board_write_screen.dart';
import 'login_screen.dart';

class BoardListScreen extends StatefulWidget {
  const BoardListScreen({super.key});

  @override
  State<BoardListScreen> createState() => _BoardListScreenState();
}

class _BoardListScreenState extends State<BoardListScreen> {
  List<dynamic> _posts = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts([String keyword = '']) async {
    setState(() { _isLoading = true; });
    try {
      final url = keyword.isEmpty ? '/api/board/list' : '/api/board/search?keyword=$keyword';
      final response = await ApiClient().dio.get(url);
      if (response.data['success'] == true) {
        setState(() { _posts = response.data['data']; });
      }
    } catch (e) {
      debugPrint('Error fetching posts: $e');
    } finally {
      setState(() { _isLoading = false; });
    }
  }

  Future<void> _handleLogout() async {
    try {
      await ApiClient().dio.get('/api/auth/logout'); // 서버 세션 파기
    } catch (e) {
      debugPrint('Logout error: $e');
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('로그아웃 되었습니다.')));
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('게시판 목록'),
        automaticallyImplyLeading: false, // 뒤로가기 숨김
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: '로그아웃',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: Column(
        children: [
          // 게시글 검색창 UI 추가
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: Semantics(identifier: 'search_input', child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: '제목으로 검색하세요',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 16),
                    ),
                    onSubmitted: (value) => _fetchPosts(value),
                  )),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.search, color: Colors.blue),
                  onPressed: () => _fetchPosts(_searchController.text),
                )
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _posts.isEmpty
                    ? Center(child: Semantics(identifier: 'empty_result_msg', child: const Text('게시글이 없습니다.')))
                    : Semantics(identifier: 'search_results_list', child: ListView.builder(
                        itemCount: _posts.length,
                        itemBuilder: (context, index) {
                          final post = _posts[index];
                          return ListTile(
                            title: Text(post['post_title'] ?? ''),
                            subtitle: Text('${post['post_id']} | ${post['post_time']} | 조회수: ${post['post_hit']}'),
                            trailing: Text('댓글 ${post['comm_count']}'),
                            onTap: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BoardViewScreen(postNum: post['post_num']),
                                ),
                              );
                              _fetchPosts(_searchController.text); // 상세에서 돌아오면 새로고침
                            },
                          );
                        },
                      )),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: '글쓰기',
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const BoardWriteScreen()),
          );
          _fetchPosts(_searchController.text); // 작성 후 돌아오면 새로고침
        },
        child: const Icon(Icons.edit),
      ),
    );
  }
}

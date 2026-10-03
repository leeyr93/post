import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';
import 'board_update_screen.dart';

class BoardViewScreen extends StatefulWidget {
  final int postNum;
  const BoardViewScreen({super.key, required this.postNum});

  @override
  State<BoardViewScreen> createState() => _BoardViewScreenState();
}

class _BoardViewScreenState extends State<BoardViewScreen> {
  Map<String, dynamic>? _post;
  List<dynamic> _comments = [];
  bool _isLoading = true;
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchPostAndComments();
  }

  Future<void> _fetchPostAndComments() async {
    setState(() { _isLoading = true; });
    try {
      final postRes = await ApiClient().dio.get('/api/board/view/${widget.postNum}');
      final commRes = await ApiClient().dio.get('/api/comment/list/${widget.postNum}');
      
      if (postRes.data['success'] == true) {
        setState(() {
          _post = postRes.data['data'];
          _comments = commRes.data['data'] ?? [];
        });
      }
    } catch (e) {
      debugPrint('Error fetching view: $e');
    } finally {
      setState(() { _isLoading = false; });
    }
  }

  Future<void> _deletePost() async {
    try {
      await ApiClient().dio.delete('/api/board/delete/${widget.postNum}');
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '본인이 작성한 글만 삭제할 수 있습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
      }
    }
  }

  Future<void> _addComment() async {
    if (_commentController.text.isEmpty) return;
    try {
      await ApiClient().dio.post(
        '/api/comment/write',
        data: {'post_num': widget.postNum, 'comm_content': _commentController.text},
      );
      _commentController.clear();
      FocusScope.of(context).unfocus();
      _fetchPostAndComments(); 
    } catch (e) {
      if (mounted) {
        String errorMsg = '댓글 작성에 실패했습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
      }
    }
  }

  Future<void> _deleteComment(int commNum) async {
    try {
      await ApiClient().dio.delete('/api/comment/delete/${widget.postNum}/$commNum');
      _fetchPostAndComments();
    } catch (e) {
      if (mounted) {
        String errorMsg = '본인이 작성한 댓글만 삭제할 수 있습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
      }
    }
  }

  Future<void> _showEditCommentDialog(int commNum, String oldContent) async {
    final ctrl = TextEditingController(text: oldContent);
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('댓글 수정'),
        content: Semantics(identifier: 'edit_comment_input', child: TextField(controller: ctrl, decoration: const InputDecoration(hintText: '내용을 입력하세요'))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('취소')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiClient().dio.put(
                  '/api/comment/update/${widget.postNum}/$commNum',
                  data: {'comm_content': ctrl.text},
                );
                Navigator.pop(context, true);
              } catch (e) {
                if (mounted) {
                  String errorMsg = '본인이 작성한 댓글만 수정할 수 있습니다.';
                  if (e is DioException && e.response?.data != null && e.response!.data is Map) {
                    errorMsg = e.response!.data['message'] ?? errorMsg;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
                }
                Navigator.pop(context, false);
              }
            },
            child: Semantics(identifier: 'edit_comment_submit_btn', child: const Text('수정')),
          ),
        ],
      ),
    );
    if (result == true) _fetchPostAndComments();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _post == null) {
      return Scaffold(appBar: AppBar(title: const Text('게시글 상세')), body: const Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('게시글 상세'),
        actions: [
          if (ApiClient().currentUserId == _post!['post_id'])
            Semantics(identifier: 'post_more_btn', child: PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert),
            onSelected: (value) async {
              if (value == 'edit') {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => BoardUpdateScreen(
                      postNum: widget.postNum,
                      initialTitle: _post!['post_title'],
                      initialContent: _post!['post_content'],
                    ),
                  ),
                );
                if (result == true) _fetchPostAndComments();
              } else if (value == 'delete') {
                _deletePost();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(value: 'edit', child: Semantics(identifier: 'post_menu_edit', child: Text('글 수정'))),
              PopupMenuItem(value: 'delete', child: Semantics(identifier: 'post_menu_delete', child: Text('글 삭제', style: TextStyle(color: Colors.red)))),
            ],
          )),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                Text(_post!['post_title'] ?? '', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('작성자: ${_post!['post_id']} | 조회수: ${_post!['post_hit']} | ${_post!['post_time']}', style: const TextStyle(color: Colors.grey)),
                const Divider(height: 32, thickness: 1),
                Text(_post!['post_content'] ?? '', style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 32),
                const Text('댓글', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Divider(),
                ..._comments.map((comm) => ListTile(
                  contentPadding: const EdgeInsets.symmetric(vertical: 4.0),
                  title: Row(
                    children: [
                      Text(
                        comm['comm_id'], 
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey[700])
                      ),
                      const SizedBox(width: 8),
                      Text(
                        comm['comm_time'] ?? '', 
                        style: const TextStyle(color: Colors.grey, fontSize: 12)
                      ),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Semantics(identifier: 'comment_content_${comm['comm_content']}', child: Text(
                      comm['comm_content'], 
                      style: const TextStyle(fontSize: 16, color: Colors.black87)
                    )),
                  ),
                  trailing: ApiClient().currentUserId == comm['comm_id']
                    ? Semantics(identifier: 'comment_more_btn_${comm['comm_content']}', child: PopupMenuButton<String>(
                        icon: const Icon(Icons.more_horiz, size: 20),
                        onSelected: (value) {
                          if (value == 'edit') _showEditCommentDialog(comm['comm_num'], comm['comm_content']);
                          else if (value == 'delete') _deleteComment(comm['comm_num']);
                        },
                        itemBuilder: (context) => [
                          PopupMenuItem(value: 'edit', child: Semantics(identifier: 'comment_menu_edit', child: Text('수정'))),
                          PopupMenuItem(value: 'delete', child: Semantics(identifier: 'comment_menu_delete', child: Text('삭제', style: TextStyle(color: Colors.red)))),
                        ],
                      ))
                    : null,
                )),
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: Semantics(identifier: 'comment_input', child: TextField(
                      controller: _commentController,
                      decoration: InputDecoration(
                        hintText: '댓글을 입력하세요...', 
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    )),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _addComment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Semantics(identifier: 'comment_submit_btn', child: const Text('등록', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

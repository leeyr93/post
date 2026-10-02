import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';

class BoardWriteScreen extends StatefulWidget {
  const BoardWriteScreen({super.key});

  @override
  State<BoardWriteScreen> createState() => _BoardWriteScreenState();
}

class _BoardWriteScreenState extends State<BoardWriteScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submitPost() async {
    if (_titleController.text.isEmpty || _contentController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('제목과 내용을 모두 입력해주세요.')));
      return;
    }

    setState(() { _isSubmitting = true; });
    try {
      final response = await ApiClient().dio.post(
        '/api/board/write',
        data: {
          'post_title': _titleController.text,
          'post_content': _contentController.text,
        },
      );
      if (response.data['success'] == true) {
        if (mounted) {
          Navigator.pop(context); 
        }
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '게시글 등록에 실패했습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(errorMsg)));
      }
    } finally {
      if (mounted) setState(() { _isSubmitting = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('글쓰기')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _titleController, 
              decoration: const InputDecoration(labelText: '제목', border: OutlineInputBorder())
            ),
            const SizedBox(height: 16),
            Expanded(
              child: TextField(
                controller: _contentController,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                decoration: const InputDecoration(labelText: '내용을 입력하세요', border: OutlineInputBorder(), alignLabelWithHint: true),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitPost,
                child: _isSubmitting 
                    ? const CircularProgressIndicator(color: Colors.white) 
                    : const Text('등록하기', style: TextStyle(fontSize: 18)),
              ),
            )
          ],
        ),
      ),
    );
  }
}

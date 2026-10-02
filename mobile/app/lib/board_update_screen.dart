import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';

class BoardUpdateScreen extends StatefulWidget {
  final int postNum;
  final String initialTitle;
  final String initialContent;
  
  const BoardUpdateScreen({super.key, required this.postNum, required this.initialTitle, required this.initialContent});

  @override
  State<BoardUpdateScreen> createState() => _BoardUpdateScreenState();
}

class _BoardUpdateScreenState extends State<BoardUpdateScreen> {
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.initialTitle);
    _contentController = TextEditingController(text: widget.initialContent);
  }

  Future<void> _submitUpdate() async {
    if (_titleController.text.isEmpty || _contentController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('제목과 내용을 모두 입력해주세요.')));
      return;
    }

    setState(() { _isSubmitting = true; });
    try {
      final response = await ApiClient().dio.put(
        '/api/board/update/${widget.postNum}',
        data: {
          'post_title': _titleController.text,
          'post_content': _contentController.text,
        },
      );
      if (response.data['success'] == true) {
        if (mounted) {
          Navigator.pop(context, true); 
        }
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '본인이 작성한 글만 수정할 수 있습니다.';
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
      appBar: AppBar(title: const Text('글 수정하기')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(controller: _titleController, decoration: const InputDecoration(labelText: '제목', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            Expanded(
              child: TextField(
                controller: _contentController,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                decoration: const InputDecoration(labelText: '내용', border: OutlineInputBorder(), alignLabelWithHint: true),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitUpdate,
                child: _isSubmitting ? const CircularProgressIndicator(color: Colors.white) : const Text('수정 완료', style: TextStyle(fontSize: 18)),
              ),
            )
          ],
        ),
      ),
    );
  }
}

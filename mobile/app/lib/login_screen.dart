import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';
import 'board_list_screen.dart';
import 'join_screen.dart';
import 'find_account_screen.dart'; 

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _idController = TextEditingController();
  final TextEditingController _pwController = TextEditingController();
  bool _isLoading = false;
  String _serverError = ''; // 화면에 고정할 에러 메시지

  Future<void> _handleLogin() async {
    setState(() { _serverError = ''; }); // 요청 전 에러 초기화

    if (_idController.text.isEmpty && _pwController.text.isEmpty) {
      setState(() { _serverError = '아이디, 비밀번호를 입력해주세요.'; });
      return;
    } else if (_idController.text.isEmpty) {
      setState(() { _serverError = '아이디를 입력해주세요.'; });
      return;
    } else if (_pwController.text.isEmpty) {
      setState(() { _serverError = '비밀번호를 입력해주세요.'; });
      return;
    }

    setState(() { _isLoading = true; });

    try {
      final response = await ApiClient().dio.post(
        '/api/auth/login',
        data: {
          'id': _idController.text,
          'password': _pwController.text,
        },
      );

      if (response.data['success'] == true) {
        ApiClient().currentUserId = response.data['data']['id'];
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const BoardListScreen()),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '아이디 또는 비밀번호가 일치하지 않습니다.';
        if (e is DioException && e.response?.data != null) {
          try {
            var rData = e.response!.data;
            if (rData is String) rData = jsonDecode(rData);
            if (rData is Map && rData['message'] != null) {
              errorMsg = rData['message'];
            }
          } catch (_) {}
        }
        // 에러를 토스트가 아닌 화면에 직접 노출
        setState(() { _serverError = errorMsg; });
      }
    } finally {
      if (mounted) {
        setState(() { _isLoading = false; });
      }
    }
  }

  @override
  void dispose() {
    _idController.dispose();
    _pwController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('게시판 로그인')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _idController,
              decoration: const InputDecoration(labelText: '아이디', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _pwController,
              obscureText: true,
              decoration: const InputDecoration(labelText: '비밀번호', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 24),
            
            // 서버 에러 메시지 고정 노출 영역
            if (_serverError.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  _serverError,
                  style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('로그인', style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const FindAccountScreen()),
                    );
                  },
                  child: const Text('계정 찾기 (ID/PW)', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold)),
                ),
                const Text('|', style: TextStyle(color: Colors.black54)),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const JoinScreen()),
                    );
                  },
                  child: const Text('회원가입', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

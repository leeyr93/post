import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';

class FindAccountScreen extends StatelessWidget {
  const FindAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('계정 찾기'),
          bottom: const TabBar(
            tabs: [
              Tab(text: '아이디 찾기'),
              Tab(text: '비밀번호 재설정'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _FindIdTab(),
            _FindPwTab(),
          ],
        ),
      ),
    );
  }
}

class _FindIdTab extends StatefulWidget {
  const _FindIdTab();
  @override
  State<_FindIdTab> createState() => _FindIdTabState();
}

class _FindIdTabState extends State<_FindIdTab> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String _foundId = '';
  String _serverError = ''; // 고정 에러 메시지

  Future<void> _handleFindId() async {
    setState(() { _serverError = ''; _foundId = ''; });

    if (_nameController.text.isEmpty || _emailController.text.isEmpty) {
      setState(() { _serverError = '이름과 이메일을 모두 입력해주세요.'; });
      return;
    }

    setState(() { _isLoading = true; });
    try {
      final response = await ApiClient().dio.post(
        '/api/auth/find_id',
        data: {'name': _nameController.text, 'email': _emailController.text},
      );
      if (response.data['success'] == true) {
        setState(() { _foundId = response.data['data']['id']; });
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '일치하는 회원 정보가 없습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        setState(() { _serverError = errorMsg; });
      }
    } finally {
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          const SizedBox(height: 16),
          TextField(controller: _nameController, decoration: const InputDecoration(labelText: '가입한 이름', border: OutlineInputBorder())),
          const SizedBox(height: 16),
          TextField(controller: _emailController, decoration: const InputDecoration(labelText: '가입한 이메일', border: OutlineInputBorder())),
          const SizedBox(height: 24),

          // 에러 메시지 고정 영역
          if (_serverError.isNotEmpty)
            Container(
              padding: const EdgeInsets.only(bottom: 16),
              child: Semantics(container: true, label: _serverError, child: Text(_serverError, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
            ),

          SizedBox(
            width: double.infinity, height: 50,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleFindId,
              child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('아이디 찾기', style: TextStyle(fontSize: 16)),
            ),
          ),
          const SizedBox(height: 32),
          if (_foundId.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.blue.shade50,
              child: Semantics(
                label: '회원님의 아이디는 [ $_foundId ] 입니다.',
                child: Text(
                '회원님의 아이디는 [ $_foundId ] 입니다.', 
                style: const TextStyle(fontSize: 18, color: Colors.blue, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              ),
            ),
        ],
      ),
    );
  }
}

class _FindPwTab extends StatefulWidget {
  const _FindPwTab();
  @override
  State<_FindPwTab> createState() => _FindPwTabState();
}

class _FindPwTabState extends State<_FindPwTab> {
  final _idController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _newPwController = TextEditingController();
  final _newPwConfirmController = TextEditingController();
  
  bool _isLoading = false;
  bool _isVerified = false;
  String _serverError = ''; // 고정 에러 메시지

  Future<void> _handleVerifyUser() async {
    setState(() { _serverError = ''; });

    if (_idController.text.isEmpty || _nameController.text.isEmpty || _emailController.text.isEmpty) {
      setState(() { _serverError = '아이디, 이름, 이메일을 모두 입력해주세요.'; });
      return;
    }

    setState(() { _isLoading = true; });
    try {
      final response = await ApiClient().dio.post(
        '/api/auth/find_pw',
        data: {'id': _idController.text, 'name': _nameController.text, 'email': _emailController.text},
      );
      if (response.data['success'] == true) {
        setState(() { _isVerified = true; });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('정보가 확인되었습니다. 새 비밀번호를 입력해주세요.')));
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '일치하는 회원 정보가 없습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        setState(() { _serverError = errorMsg; });
      }
    } finally {
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  Future<void> _handleResetPw() async {
    setState(() { _serverError = ''; });

    if (_newPwController.text.isEmpty) {
      setState(() { _serverError = '새 비밀번호를 입력해주세요.'; });
      return;
    }
    if (_newPwConfirmController.text.isEmpty) {
      setState(() { _serverError = '새 비밀번호를 재입력해주세요.'; });
      return;
    }
    if (_newPwController.text != _newPwConfirmController.text) {
      setState(() { _serverError = '비밀번호가 일치하지 않습니다.'; });
      return;
    }

    setState(() { _isLoading = true; });
    try {
      final response = await ApiClient().dio.post(
        '/api/auth/re_pw',
        data: {'id': _idController.text, 'password': _newPwController.text, 'repassword': _newPwConfirmController.text},
      );
      if (response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.')));
          Navigator.pop(context);
        }
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '비밀번호 변경에 실패했습니다.';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
        setState(() { _serverError = errorMsg; });
      }
    } finally {
      if (mounted) setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          const SizedBox(height: 16),
          TextField(controller: _idController, enabled: !_isVerified, decoration: const InputDecoration(labelText: '가입한 아이디', border: OutlineInputBorder())),
          const SizedBox(height: 16),
          TextField(controller: _nameController, enabled: !_isVerified, decoration: const InputDecoration(labelText: '가입한 이름', border: OutlineInputBorder())),
          const SizedBox(height: 16),
          TextField(controller: _emailController, enabled: !_isVerified, decoration: const InputDecoration(labelText: '가입한 이메일', border: OutlineInputBorder())),
          const SizedBox(height: 24),
          
          if (_serverError.isNotEmpty && !_isVerified)
            Container(
              padding: const EdgeInsets.only(bottom: 16),
              child: Semantics(container: true, label: _serverError, child: Text(_serverError, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
            ),

          if (!_isVerified)
            SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleVerifyUser,
                child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('회원 정보 확인', style: TextStyle(fontSize: 16)),
              ),
            ),

          if (_isVerified) ...[
            const Divider(height: 40, thickness: 1),
            TextField(controller: _newPwController, obscureText: true, decoration: const InputDecoration(labelText: '새 비밀번호', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextField(controller: _newPwConfirmController, obscureText: true, decoration: const InputDecoration(labelText: '새 비밀번호 확인', hintText: '비밀번호 재입력', border: OutlineInputBorder())),
            const SizedBox(height: 24),
            
            if (_serverError.isNotEmpty)
              Container(
                padding: const EdgeInsets.only(bottom: 16),
                child: Semantics(container: true, label: _serverError, child: Text(_serverError, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
              ),

            SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleResetPw,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('새 비밀번호로 설정하기', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
          ]
        ],
      ),
    );
  }
}

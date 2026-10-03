import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'api_client.dart';

class JoinScreen extends StatefulWidget {
  const JoinScreen({super.key});

  @override
  State<JoinScreen> createState() => _JoinScreenState();
}

class _JoinScreenState extends State<JoinScreen> {
  final _formKey = GlobalKey<FormState>(); 
  final TextEditingController _idController = TextEditingController();
  final TextEditingController _pwController = TextEditingController();
  final TextEditingController _pwConfirmController = TextEditingController(); 
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  bool _isLoading = false;
  String _serverError = ''; 

  Future<void> _handleJoin() async {
    setState(() { _serverError = ''; }); 

    if (!_formKey.currentState!.validate()) {
      return; 
    }

    setState(() { _isLoading = true; });

    try {
      final response = await ApiClient().dio.post(
        '/api/auth/join',
        data: {
          'id': _idController.text,
          'password': _pwController.text,
          'name': _nameController.text,
          'email': _emailController.text,
        },
      );

      if (response.data['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('회원가입이 완료되었습니다! 로그인해주세요. 🎉')),
          );
          Navigator.pop(context); 
        }
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = '서버와 연결할 수 없거나 응답이 없습니다. (서버 상태를 확인해주세요)';
        if (e is DioException && e.response?.data != null && e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? errorMsg;
        }
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
    _pwConfirmController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('회원가입')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey, 
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              TextFormField(
                controller: _idController,
                decoration: const InputDecoration(
                  labelText: '아이디',
                  hintText: '영문, 숫자 조합 1~10자',
                  border: OutlineInputBorder(),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  errorMaxLines: 3, // 에러 메시지가 길 때 줄바꿈 허용
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return '아이디를 입력해주세요.';
                  if (!RegExp(r'^[A-Za-z0-9]{1,10}$').hasMatch(value)) {
                    return "아이디는 '특수문자를 제외한 문자 조합. 1-10자' 형식에 맞게 입력해주세요.";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pwController,
                obscureText: true,
                
                decoration: const InputDecoration(
                  labelText: '비밀번호',
                  hintText: '영문, 숫자, 특수문자 조합 8~16자',
                  border: OutlineInputBorder(),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  errorMaxLines: 3, // 에러 메시지가 길 때 줄바꿈 허용
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return '비밀번호를 입력해주세요.';
                  if (!RegExp(r'''^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>/?]).{8,16}$''').hasMatch(value)) {
                    return "비밀번호는 '영문, 숫자, 특수문자 조합. 8-16자' 형식에 맞게 입력해주세요.";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pwConfirmController,
                obscureText: true,
                
                decoration: const InputDecoration(
                  labelText: '비밀번호 확인',
                  hintText: '비밀번호 재입력',
                  border: OutlineInputBorder(),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  errorMaxLines: 3, // 에러 메시지가 길 때 줄바꿈 허용
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return '비밀번호를 재입력해주세요.';
                  if (value != _pwController.text) return '비밀번호가 일치하지 않습니다.';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: '이름',
                  hintText: '한글 또는 영문 1~10자',
                  border: OutlineInputBorder(),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  errorMaxLines: 3, // 에러 메시지가 길 때 줄바꿈 허용
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) return '이름을 입력해주세요.';
                  if (!RegExp(r'^[A-Za-z가-힣]{1,10}$').hasMatch(value.trim())) {
                    return "이름은 '숫자, 특수문자를 제외한 문자 조합. 1-10자' 형식에 맞게 입력해주세요.";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: '이메일',
                  hintText: '예) example@gmail.com',
                  border: OutlineInputBorder(),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  errorMaxLines: 3, // 에러 메시지가 길 때 줄바꿈 허용
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return '이메일을 입력해주세요.';
                  if (!RegExp(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$').hasMatch(value)) {
                    return "이메일은 '예) example@gmail.com' 형식에 맞게 입력해주세요.";
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              
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
                  onPressed: _isLoading ? null : _handleJoin,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.lightBlue[300]),
                  child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.white) 
                      : Semantics(identifier: 'btn_submit_signup', child: const Text('회원가입', style: TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold))),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

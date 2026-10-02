import 'package:flutter/material.dart';
import 'api_client.dart';
import 'login_screen.dart';

void main() async {
  // 플러터 엔진 초기화 보장
  WidgetsFlutterBinding.ensureInitialized();
  
  // 우리가 만든 ApiClient(세션 쿠키 기능) 초기화
  await ApiClient().init(); 
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '모바일 게시판',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const LoginScreen(), // 첫 화면을 로그인 화면으로 설정
    );
  }
}

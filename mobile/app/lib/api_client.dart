import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;
  late PersistCookieJar cookieJar;
  bool _isInitialized = false;
  String? currentUserId;

  factory ApiClient() => _instance;

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      // [주의] iOS 시뮬레이터는 localhost, Android 에뮬레이터는 10.0.2.2 를 사용합니다.
      // 현재는 로컬 웹서버와 통신하기 위해 세팅해 두었습니다.
      baseUrl: 'http://127.0.0.1:50006', 
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 3),
      contentType: Headers.jsonContentType, 
    ));
  }

  // 앱 시작 시 한 번 호출하여 쿠키(세션) 저장소를 초기화합니다.
  Future<void> init() async {
    if (_isInitialized) return;
    
    final dir = await getApplicationDocumentsDirectory();
    cookieJar = PersistCookieJar(
      ignoreExpires: true,
      storage: FileStorage(dir.path), // 앱 내부 저장소에 쿠키 저장
    );
    
    dio.interceptors.add(CookieManager(cookieJar));
    _isInitialized = true;
  }
}

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from incidents.models import CustomUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para obtener tokens JWT
    Incluye información del usuario Y SU ROL en la respuesta
    """
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar datos del usuario al token
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role  # ← IMPORTANTE: Incluir rol en token
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar información del usuario a la respuesta
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,  # ← IMPORTANTE: Enviar rol al frontend
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener tokens JWT
    POST /api/auth/token/
    """
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint de login para la tesis
    POST /api/auth/login/
    
    Body:
    {
        "username": "admin",
        "password": "admin123"
    }
    
    Respuesta exitosa (200):
    {
        "access": "eyJ...",
        "refresh": "eyJ...",
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@talleres.ec",
            "role": "admin",
            "first_name": "Admin"
        }
    }
    """
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Validar que tenga usuario y contraseña
    if not username or not password:
        return Response(
            {'error': 'Usuario y contraseña son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Intentar autenticar
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Credenciales inválidas'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generar tokens JWT
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,  # ← EL ROL ES CLAVE PARA EL FRONTEND
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Endpoint para registrar nuevo usuario
    POST /api/auth/register/
    
    Body:
    {
        "username": "juan",
        "email": "juan@talleres.ec",
        "password": "segura123",
        "first_name": "Juan",
        "role": "employee"  # admin, analyst, employee
    }
    """
    
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    role = request.data.get('role', 'employee')  # Por defecto empleado
    
    # Validaciones
    if not username or not email or not password:
        return Response({
            'error': 'username, email y password son requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar que el rol sea válido
    valid_roles = ['admin', 'analyst', 'employee']
    if role not in valid_roles:
        return Response({
            'error': f'Role debe ser uno de: {", ".join(valid_roles)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar si el usuario ya existe
    if CustomUser.objects.filter(username=username).exists():
        return Response({
            'error': f'El usuario {username} ya existe'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if CustomUser.objects.filter(email=email).exists():
        return Response({
            'error': f'El email {email} ya está registrado'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Crear el usuario personalizado
    try:
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            role=role  # ← Asignar rol al crear usuario
        )
        
        return Response({
            'status': 'success',
            'message': 'Usuario registrado correctamente',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'first_name': user.first_name,
            }
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Obtener perfil del usuario autenticado
    GET /api/auth/profile/
    Headers: Authorization: Bearer <token>
    """
    user = request.user
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,  # ← Mostrar rol del usuario
        'first_name': user.first_name,
        'last_name': user.last_name,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint (informativo)
    El logout real se hace en el frontend eliminando el token
    GET /api/auth/logout/
    """
    return Response({
        'message': 'Logout exitoso. El token ha sido invalidado en el frontend.'
    })

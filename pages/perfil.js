import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Image from 'next/image';
import ProfilePhotoUpdater from '../components/ProfilePhotoUpdater';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import { 
  FiUser, FiLock, FiSettings, FiCalendar, FiClock, FiMail, FiCheck, FiAlertTriangle,
  FiBell, FiLogOut, FiClipboard, FiEdit
} from 'react-icons/fi';
import { BiLeaf } from 'react-icons/bi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

export default function Perfil() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Estados para información personal
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para estadísticas
  const [userStats, setUserStats] = useState({
    totalPlants: 0,
    totalReminders: 0,
    joinDate: '',
    lastLogin: ''
  });

  const loadUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      // Cargar plantas
      const plantsResponse = await fetch(`${apiUrl}/plants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (plantsResponse.ok) {
        const plants = await plantsResponse.json();
        let totalReminders = 0;
        
        // Cargar recordatorios de todas las plantas
        for (const plant of plants) {
          try {
            const remindersResponse = await fetch(`${apiUrl}/reminders/${plant.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (remindersResponse.ok) {
              const reminders = await remindersResponse.json();
              totalReminders += reminders.length;
            }
          } catch (error) {
            console.error(`Error loading reminders for plant ${plant.id}:`, error);
          }
        }
        
        setUserStats({
          totalPlants: plants.length,
          totalReminders: totalReminders,
          joinDate: user.metadata.creationTime || '',
          lastLogin: user.metadata.lastSignInTime || ''
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Cargar datos del perfil
    setProfileData({
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || ''
    });

    // Cargar estadísticas
    loadUserStats();
  }, [user, router, loadUserStats]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      toast.success(
        (t) => (
          <div>
            <p className="font-medium">¡Perfil actualizado!</p>
            <p className="text-sm opacity-90">Los cambios se han guardado exitosamente</p>
          </div>
        ),
        {
          duration: 4000,
        }
      );
    } catch (error) {
      toast.error(
        (t) => (
          <div>
            <p className="font-medium">Error al actualizar el perfil</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        ),
        {
          duration: 6000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Reautenticar usuario
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Actualizar contraseña
      await updatePassword(user, passwordData.newPassword);

      toast.success(
        (t) => (
          <div>
            <p className="font-medium">¡Contraseña actualizada!</p>
            <p className="text-sm opacity-90">Tu contraseña se ha cambiado exitosamente</p>
          </div>
        ),
        {
          duration: 4000,
        }
      );

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      let errorMessage = 'Error al actualizar la contraseña';
      let errorDetail = error.message;
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
        errorDetail = 'La contraseña actual es incorrecta';
      }
      
      toast.error(
        (t) => (
          <div>
            <p className="font-medium">{errorMessage}</p>
            <p className="text-sm opacity-90">{errorDetail}</p>
          </div>
        ),
        {
          duration: 6000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handlePhotoUpdate = (newPhotoURL) => {
    setProfileData(prev => ({
      ...prev,
      photoURL: newPhotoURL
    }));
    // El toast se maneja en el componente ProfilePhotoUpdater
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.photoURL || profileData.photoURL ? (
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:border-green-200 transition-colors duration-200">
                    <Image
                      src={user.photoURL || profileData.photoURL}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ProfilePhotoUpdater 
                    user={user} 
                    onUpdate={handlePhotoUpdate}
                    className="absolute inset-0"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white group-hover:border-green-200 transition-colors duration-200">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                     user.email ? user.email.charAt(0).toUpperCase() : '?'}
                  </div>
                  <ProfilePhotoUpdater 
                    user={user} 
                    onUpdate={handlePhotoUpdate}
                    className="absolute inset-0"
                  />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {user.displayName || 'Usuario'}
              </h1>
              <p className="text-green-100">{user.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.emailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.emailVerified ? (
                    <>
                      <FiCheck className="w-3 h-3 mr-1" />
                      Verificado
                    </>
                  ) : (
                    <>
                      <FiAlertTriangle className="w-3 h-3 mr-1" />
                      No verificado
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <BiLeaf className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Plantas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.totalPlants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiBell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Recordatorios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.totalReminders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FiCalendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Miembro desde</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDateShort(userStats.joinDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FiClock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Último acceso</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDateShort(userStats.lastLogin)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiUser className="inline w-4 h-4 mr-2" />
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiLock className="inline w-4 h-4 mr-2" />
                Cambiar Contraseña
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiSettings className="inline w-4 h-4 mr-2" />
                Configuración de Cuenta
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Información Personal */}
            {activeTab === 'info' && (
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre para mostrar
                    </label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      El email no se puede cambiar
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de foto de perfil
                    </label>
                    <input
                      type="url"
                      value={profileData.photoURL}
                      onChange={(e) => setProfileData({...profileData, photoURL: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="https://ejemplo.com/mi-foto.jpg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Cambiar Contraseña */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Preferencias - Redirige a Configuración */}
            {activeTab === 'preferences' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  <FiSettings className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Configuración y Preferencias
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Las preferencias de la aplicación se han movido a una página dedicada para una mejor organización.
                </p>
                <button
                  onClick={() => router.push('/configuracion')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
                >
                  <FiSettings className="w-4 h-4 mr-2" />
                  Ir a Configuración
                </button>
              </div>
            )}

            {/* Tab: Configuración de Cuenta */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Información de la Cuenta */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FiClipboard className="w-5 h-5 mr-2" />
                    Información de la Cuenta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">ID de Usuario:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        {user.uid.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Email verificado:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.emailVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {user.emailVerified ? (
                          <>
                            <FiCheck className="w-3 h-3 mr-1" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <FiAlertTriangle className="w-3 h-3 mr-1" />
                            Pendiente
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cuenta creada:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(userStats.joinDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Último acceso:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(userStats.lastLogin)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Proveedor:</span>
                      <span className="text-gray-900 dark:text-white flex items-center">
                        {user.providerData[0]?.providerId === 'google.com' ? (
                          <>
                            <FaGoogle className="w-4 h-4 mr-1" />
                            Google
                          </>
                        ) : user.providerData[0]?.providerId === 'facebook.com' ? (
                          <>
                            <FaFacebook className="w-4 h-4 mr-1" />
                            Facebook
                          </>
                        ) : (
                          <>
                            <FiMail className="w-4 h-4 mr-1" />
                            Email/Contraseña
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Configuración rápida */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                    <FiSettings className="w-5 h-5 mr-2" />
                    Configuración Rápida
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push('/configuracion')}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center mb-2">
                        <FiEdit className="w-5 h-5 mr-2 text-purple-600" />
                        <span className="font-medium text-gray-900 dark:text-white">Preferencias</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tema, idioma, notificaciones
                      </p>
                    </button>
                    
                    <button
                      onClick={() => router.push('/recordatorios')}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center mb-2">
                        <FiBell className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">Recordatorios</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gestionar recordatorios de plantas
                      </p>
                    </button>
                  </div>
                </div>

                {/* Zona de Peligro */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                    <FiAlertTriangle className="w-5 h-5 mr-2" />
                    Zona de Peligro
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        Cerrar Sesión
                      </h4>
                      <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                        Una vez que cierres sesión, deberás iniciar sesión nuevamente para acceder a tu cuenta.
                      </p>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

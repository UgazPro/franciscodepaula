import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  BookOpen,
  ChevronRight,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Componentes de gráficos simulados (puedes reemplazar con Recharts o Chart.js)
const AdminPanel = () => {
  const [dateRange, setDateRange] = useState('2024-2025');

  // Datos de ejemplo (simulados)
  const stats = {
    totalStudents: 1247,
    totalTeachers: 68,
    totalStaff: 42,
    overduePayments: 234,
    averageAttendance: 94.5,
    activeParents: 1890
  };

  // Promedios por año
  const gradeAverages = [
    { grade: '1er Año', average: 85.6, students: 198 },
    { grade: '2do Año', average: 87.2, students: 205 },
    { grade: '3er Año', average: 84.9, students: 212 },
    { grade: '4to Año', average: 88.3, students: 196 },
    { grade: '5to Año', average: 86.7, students: 184 }
  ];

  // Estudiantes con más incidencias
  const topIncidents = [
    { name: 'María González', grade: '3er Año', incidents: 12, type: 'Comportamiento' },
    { name: 'Carlos Méndez', grade: '2do Año', incidents: 9, type: 'Asistencia' },
    { name: 'Ana Rodríguez', grade: '4to Año', incidents: 8, type: 'Académico' },
    { name: 'Luis Fernández', grade: '5to Año', incidents: 7, type: 'Disciplina' },
    { name: 'Sofía Martínez', grade: '1er Año', incidents: 6, type: 'Comportamiento' }
  ];

  // Próximos eventos
  const upcomingEvents = [
    { date: '15 Abr', event: 'Reunión de Padres', type: 'Administrativo' },
    { date: '18 Abr', event: 'Evaluaciones Parciales', type: 'Académico' },
    { date: '22 Abr', event: 'Día del Libro', type: 'Cultural' },
    { date: '28 Abr', event: 'Entrega de Boletines', type: 'Académico' }
  ];

  // Alertas importantes
  const alerts = [
    { message: '3 estudiantes requieren reunión con psicopedagogía', priority: 'high' },
    { message: 'Mantenimiento programado para laboratorios', priority: 'medium' },
    { message: 'Actualización de datos pendiente para 45 estudiantes', priority: 'low' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <div className="bg-linear-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
              <p className="text-blue-100 mt-1">Bienvenido, Director(a) - Período {dateRange}</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <RefreshCw size={18} />
                Actualizar
              </button>
              <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <Download size={18} />
                Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Estudiantes"
            value={stats.totalStudents}
            change="+8.2%"
            color="blue"
          />
          <StatCard
            icon={GraduationCap}
            title="Profesores"
            value={stats.totalTeachers}
            change="+3"
            color="green"
          />
          <StatCard
            icon={UserCheck}
            title="Personal Administrativo"
            value={stats.totalStaff}
            change="+1"
            color="blue"
          />
          <StatCard
            icon={DollarSign}
            title="Morosidad"
            value={`${Math.round((stats.overduePayments / stats.totalStudents) * 100)}%`}
            subtitle={`${stats.overduePayments} estudiantes`}
            color="red"
          />
        </div>

        {/* Segunda fila de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Asistencia Promedio"
            value={`${stats.averageAttendance}%`}
            subtitle="Últimos 30 días"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Padres/Representantes"
            value={stats.activeParents}
            subtitle="Activos en sistema"
            color="blue"
          />
          <StatCard
            icon={AlertTriangle}
            title="Incidencias Activas"
            value="42"
            subtitle="-15% vs mes anterior"
            color="red"
          />
        </div>

        {/* Gráficos y Tablas principales */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Promedios por año */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-green-500" />
                Rendimiento Académico por Año
              </h2>
              <select className="text-sm border rounded-lg px-3 py-1 bg-white">
                <option>Período Actual</option>
                <option>Período Anterior</option>
              </select>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {gradeAverages.map((grade, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{grade.grade}</span>
                      <span className="text-gray-600">{grade.students} estudiantes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-blue-900 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${grade.average}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-blue-900 min-w-[45px]">
                        {grade.average}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Promedio General:</span>
                  <span className="font-bold text-blue-900">86.5%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Meta Institucional:</span>
                  <span className="font-bold text-green-600">90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estudiantes con más incidencias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Estudiantes con Mayor Número de Incidencias
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {topIncidents.map((student, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.grade}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {student.incidents} incidencias
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{student.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Ver todas las incidencias <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Tercera fila */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">

          {/* Distribución de Personal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <PieChart size={20} className="text-green-500" />
                Distribución del Personal
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Docentes</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-900 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <span className="font-semibold text-blue-900">{stats.totalTeachers}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Administrativos</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                  <span className="font-semibold text-blue-900">{stats.totalStaff}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Personal:</span>
                  <span className="font-bold text-blue-900">{stats.totalTeachers + stats.totalStaff}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Calendar size={20} className="text-green-500" />
                Próximos Eventos
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-gray-500">{event.date.split(' ')[0]}</p>
                    <p className="text-sm font-bold text-blue-900">{event.date.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{event.event}</p>
                    <p className="text-xs text-gray-400">{event.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                Ver calendario completo <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Alertas y Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
              <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <Activity size={20} className="text-amber-500" />
                Alertas Importantes
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {alerts.map((alert, idx) => (
                <div key={idx} className="px-6 py-3 flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${alert.priority === 'high' ? 'bg-red-500' :
                      alert.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                  <p className="text-sm text-gray-700 flex-1">{alert.message}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Ver todas las notificaciones <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Indicadores adicionales */}
        <div className="grid lg:grid-cols-4 gap-6">
          <MetricCard
            title="Aprobación General"
            value="86.5%"
            change="+3.2%"
            color="green"
          />
          <MetricCard
            title="Retención Estudiantil"
            value="96.8%"
            change="+1.5%"
            color="blue"
          />
          <MetricCard
            title="Satisfacción Docente"
            value="4.2/5"
            change="+0.3"
            color="green"
          />
          <MetricCard
            title="Participación en Actividades"
            value="78%"
            change="+12%"
            color="blue"
          />
        </div>

      </div>
    </div>
  );
};

// Componente para tarjetas de estadísticas principales
type StatCardProps = {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  color?: 'blue' | 'green' | 'red';
};

const StatCard = ({ icon: Icon, title, value, subtitle, change, color = 'blue' }: StatCardProps) => {
  const colors: Record<'blue' | 'green' | 'red', string> = {
    blue: 'from-blue-900 to-blue-700',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`bg-linear-to-br ${colors[color] || colors.blue} p-3 rounded-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs text-green-600 font-medium">{change}</span>
          <span className="text-xs text-gray-400">vs período anterior</span>
        </div>
      )}
    </div>
  );
};

// Componente para métricas pequeñas
const MetricCard = ({ title, value, change, color }: any) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-blue-900">{value}</p>
      {change && (
        <p className="text-xs text-green-600 mt-1">↑ {change}</p>
      )}
    </div>
  );
};

export default AdminPanel;
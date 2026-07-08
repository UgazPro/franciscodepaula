import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Building2, 
  CalendarCheck, 
  Settings,
  UserCircle,
  GraduationCap,
  School,
  ClipboardList,
  FileText,
  FileDown
} from "lucide-react";

export interface SidebarContent {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  redirectTo: string;
  active: boolean;
}

export const sidebarData: SidebarContent[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    redirectTo: "/admin",
    active: false,
  },
  {
    name: "Gestión Escolar",
    icon: School,
    redirectTo: "/admin/gestion-escolar",
    active: false,
  },
  {
    name: "Control de Estudio",
    icon: BookOpen,
    redirectTo: "/admin/control-estudio",
    active: false,
  },
  {
    name: "Profesores",
    icon: GraduationCap,
    redirectTo: "/admin/profesores",
    active: false,
  },
  {
    name: "Administración",
    icon: Building2,
    redirectTo: "/admin/administracion",
    active: false,
  },
  {
    name: "Estudiantes",
    icon: Users,
    redirectTo: "/admin/estudiantes",
    active: false,
  },
  {
    name: "Calendario",
    icon: CalendarCheck,
    redirectTo: "/admin/calendario",
    active: false,
  },
  {
    name: "Plan de Evaluación",
    icon: ClipboardList,
    redirectTo: "/admin/plan-evaluacion",
    active: false,
  },
  {
    name: "Notas",
    icon: FileText,
    redirectTo: "/admin/notas",
    active: false,
  },
  {
    name: "Formatos",
    icon: FileDown,
    redirectTo: "/admin/formatos",
    active: false,
  },
  {
    name: "Mi Perfil",
    icon: UserCircle,
    redirectTo: "/admin/perfil",
    active: false,
  },
  {
    name: "Configuración",
    icon: Settings,
    redirectTo: "/admin/configuracion",
    active: false,
  },
];
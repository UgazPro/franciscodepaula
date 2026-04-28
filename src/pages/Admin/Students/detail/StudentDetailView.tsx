import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { X, User, Mail, MapPin, Phone, Cake, Calendar, Clock, Award, Star, FileText, TrendingUp, CheckCircle, XCircle, DollarSign, Activity, School, Target, Zap, History, ChevronRight, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useStudentsStore } from "@/stores/students.store";
import { calculateMartialTime, dateFormatterIntoLong } from "@/helpers/formatter";

export default function StudentDetailView() {

    const { setScreen } = useStudentsStore();

    const datosFicticios = {
        identification: "123456789",
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@email.com",
        address: "Calle 123, Sector Norte, Ciudad",
        phone: "555-1234",
        sexo: "Masculino",
        dojo: "Dojo Central",
        birthday: new Date("1999-05-15"),
        profileImg: "",
        active: true,
        enrollmentDate: new Date("2024-01-15"),
        tiempoPracticando: "1 año 3 meses",
        cinturonActual: "Marrón",
        gradoActual: "2do Kyu",
        historialExamenes: [
            { fecha: "2023-09-15", cinturon: "Amarillo", resultado: "Aprobado" },
            { fecha: "2024-01-20", cinturon: "Verde", resultado: "Aprobado" },
            { fecha: "2024-06-10", cinturon: "Azul", resultado: "Aprobado" },
        ],
        proximoExamen: new Date("2024-12-15"),
        tiempoUltimoExamen: "4 meses",
        porcentajeAsistencia: 85,
        pagosAlDia: true,
        actividadesAsistidas: [
            "Clase intensiva - Marzo 2024",
            "Taller de katas - Abril 2024",
            "Torneo interno - Mayo 2024",
            "Seminario de defensa personal - Junio 2024"
        ]
    };

    return (

        <div className="min-h-full p-6 relative w-full max-w-6xl mx-auto my-6 bg-white shadow-xl border border-gray-200 rounded-xl">

            {/* Header */}
            <div className="bg-linear-to-r from-amber-50 to-red-50 border-b border-gray-300 rounded-lg">
                <h2 className="p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-linear-to-br from-amber-500 to-red-500 p-1">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                    {datosFicticios.profileImg ? (
                                        <img
                                            src={datosFicticios.profileImg}
                                            className="h-full w-full rounded-full object-cover"
                                            alt="Perfil"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-amber-600" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {datosFicticios!.name} {datosFicticios!.lastName}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    {datosFicticios!.active ? (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Activo
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Inactivo
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setScreen("list")}
                            className="h-8 w-8 p-0 hover:bg-white/50"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </h2>
            </div>

            {/* Main screen */}
            <div className="p-6 space-y-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="h-5 w-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Cédula</p>
                                        <p className="font-mono font-medium text-gray-900">{datosFicticios!.identification}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Sexo</p>
                                        <p className="font-medium text-gray-900">{datosFicticios!.sexo}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Fecha de Nacimiento</p>
                                    <div className="flex items-center gap-2">
                                        <Cake className="h-4 w-4 text-gray-500" />
                                        <p className="font-medium text-gray-900">{dateFormatterIntoLong(datosFicticios!.birthday)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tiempo Practicando</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <p className="font-medium text-gray-900">{calculateMartialTime(datosFicticios!.enrollmentDate).text}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Mail className="h-5 w-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="font-medium text-gray-900 wrap-break-word">{datosFicticios!.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                                        <p className="font-medium text-gray-900">{datosFicticios!.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Dirección</p>
                                        <p className="font-medium text-gray-900">{datosFicticios!.address}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <School className="h-5 w-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Información del Dojo</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Dojo Asignado</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <p className="font-semibold text-gray-900 text-lg">{datosFicticios!.dojo}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Fecha de Inscripción</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <p className="font-medium text-gray-900">{dateFormatterIntoLong(datosFicticios!.enrollmentDate)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-amber-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Asistencia</h3>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    {datosFicticios.porcentajeAsistencia}%
                                </Badge>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Porcentaje de Asistencia</span>
                                        <span className="font-medium">{datosFicticios.porcentajeAsistencia}%</span>
                                    </div>
                                    <Progress
                                        value={datosFicticios.porcentajeAsistencia}
                                        className="h-2 bg-gray-200"
                                    />
                                </div>
                                <div className="text-center pt-2">
                                    <p className="text-sm text-gray-600">
                                        {datosFicticios.porcentajeAsistencia >= 80 ? (
                                            <span className="text-green-600 font-medium">¡Excelente asistencia!</span>
                                        ) : datosFicticios.porcentajeAsistencia >= 60 ? (
                                            <span className="text-amber-600 font-medium">Asistencia regular</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Asistencia baja</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Estado de Pagos</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center py-4">
                                    {datosFicticios.pagosAlDia ? (
                                        <div className="space-y-2">
                                            <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                            </div>
                                            <p className="font-semibold text-green-700 text-lg">Al día con los pagos</p>
                                            <p className="text-sm text-gray-600">Último pago: 01/11/2024</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                                                <XCircle className="h-8 w-8 text-red-600" />
                                            </div>
                                            <p className="font-semibold text-red-700 text-lg">Pagos pendientes</p>
                                            <p className="text-sm text-gray-600">30 días de mora</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-amber-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Historial de Exámenes</h3>
                                </div>
                                <Badge variant="outline" className="border-gray-300 text-gray-700">
                                    {datosFicticios.tiempoUltimoExamen} desde último examen
                                </Badge>
                            </div>
                            <div className="space-y-4">
                                {datosFicticios.historialExamenes.map((examen, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-linear-to-br from-amber-500/10 to-red-500/10 flex items-center justify-center">
                                                <Award className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Cinturón {examen.cinturon}</p>
                                                <p className="text-sm text-gray-600">{examen.fecha}</p>
                                            </div>
                                        </div>
                                        <Badge className={
                                            examen.resultado === "Aprobado"
                                                ? "bg-green-100 text-green-800 border-green-200"
                                                : "bg-red-100 text-red-800 border-red-200"
                                        }>
                                            {examen.resultado}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Próximo Examen</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-amber-600" />
                                            <p className="font-semibold text-gray-900">{dateFormatterIntoLong(datosFicticios.proximoExamen)}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                        <Zap className="h-3 w-3 mr-1" />
                                        Próximo: Negro
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-300 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="h-5 w-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Actividades Asistidas</h3>
                            </div>
                            <div className="space-y-3">
                                {datosFicticios.actividadesAsistidas.map((actividad, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-linear-to-r from-white to-amber-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
                                            <Star className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{actividad}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Ha asistido a {datosFicticios.actividadesAsistidas.length} actividades especiales
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Ver todas las actividades
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border border-gray-300 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="h-5 w-5 text-amber-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Progreso hacia próximo cinturón</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Cinturón actual: {datosFicticios.cinturonActual}</span>
                                <span>Próximo: Negro</span>
                            </div>
                            <div className="relative">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-amber-500 to-red-500 rounded-full"
                                        style={{ width: '65%' }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    {['Blanco', 'Amarillo', 'Naranja', 'Verde', 'Azul', 'Marrón', 'Negro'].map((cinturon, index) => (
                                        <div key={index} className="text-center">
                                            <div className={`h-2 w-2 rounded-full mx-auto mb-1 ${index <= 5 ? 'bg-amber-500' : 'bg-gray-300'
                                                }`} />
                                            <span className={`text-xs ${index <= 5 ? 'text-amber-700 font-medium' : 'text-gray-500'
                                                }`}>
                                                {cinturon}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-amber-700">65% completado</span> hacia el cinturón negro
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-300 p-4 z-20">

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Última actualización: {format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => setScreen("list")}
                        >
                            Cerrar
                        </Button>
                        <Button className="bg-linear-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Información
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
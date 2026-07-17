import { UserCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RepresentativeInfoProps {
    representatives: any[];
}

export default function RepresentativeInfo({ representatives }: RepresentativeInfoProps) {

    return (

        <Card className="border order-(--lightBlueColor) shadow-sm">

            <CardContent className="px-6 py-1">

                <div className="flex items-center gap-2 mb-5">

                    <UserCheck className="h-5 w-5 text-(--blueColor)" />

                    <h3 className="text-lg font-semibold text-(--blueColor)">
                        Representantes
                    </h3>

                </div>

                {!representatives || representatives.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Sin representantes asignados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {representatives.map((studentRep) => {
                            const rep = studentRep.representative;
                            if (!rep) return null;
                            const repPerson = rep.user.person;
                            const isPrimary = studentRep.isPrimary === true;
                            return (
                                <Card key={studentRep.id} className={`border shadow-sm ${isPrimary ? "border-(--blueColor)/40 bg-(--blueColor)/5" : "order-(--lightBlueColor)"}`}>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) flex items-center justify-center text-white font-bold shrink-0">
                                                {repPerson.firstNames.charAt(0)}{repPerson.lastNames.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {repPerson.firstNames} {repPerson.lastNames}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {studentRep.relationship || "Sin parentesco"}
                                                    </span>
                                                    {isPrimary ? (
                                                        <Badge className="bg-(--blueColor)/10 text-(--blueColor) border-(--blueColor)/30 text-[11px] px-2 py-0.5">
                                                            <Star className="h-3 w-3 mr-0.5 inline" />
                                                            Representante Legal
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500 border-gray-300 text-[11px] px-2 py-0.5">
                                                            Representante
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Cédula</p>
                                                <p className="font-medium text-gray-800">{repPerson.identificationNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Teléfono</p>
                                                <p className="font-medium text-gray-800">{rep.user.phone || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-gray-500">Correo Electrónico</p>
                                            <p className="font-medium text-gray-800 truncate">{rep.user.email || "—"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

            </CardContent>

        </Card>

    );

}

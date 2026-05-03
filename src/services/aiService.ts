import { GoogleGenAI, Type } from "@google/genai";
import { crmService } from "../features/crm/services/crmService";
import { auth } from "../lib/firebase";

export async function getAdvisorResponse(query: string, organizationId: string, history: { role: 'user' | 'ai', content: string }[] = []) {
  if (!process.env.GEMINI_API_KEY) {
    return "Error: GEMINI_API_KEY no configurada. Por favor, asegúrate de que la clave esté disponible en el entorno.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Define the scheduling function
    const scheduleAppointmentTool = {
      functionDeclarations: [
        {
          name: "schedule_appointment",
          description: "Agendar una cita o reunión con un asesor humano.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Fecha de la cita (YYYY-MM-DD)" },
              time: { type: Type.STRING, description: "Hora de la cita (HH:MM)" },
              notes: { type: Type.STRING, description: "Notas adicionales o motivo de la reunión" },
              userName: { type: Type.STRING, description: "Nombre del cliente" },
            },
            required: ["date", "time", "userName"]
          }
        }
      ]
    };

    // Prepare contents including history
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: query }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: `Eres la Asesora IA de I LIKE Real Estate, una empresa innovadora en La Paz con proyección nacional e internacional. 
          Tu objetivo es ayudar a los usuarios en el mercado inmobiliario metropolitano. 
          CAPACIDAD ESPECIAL: Puedes agendar citas directamente usando la herramienta 'schedule_appointment'. 
          CAPACIDAD ESPECIAL: Puedes informar sobre el estado de 'Verificación de Activos'. Los activos verificados ('verified') son protocolos de alta fidelidad. Los pendientes ('pending') están en fase de auditoría.
          Si el usuario pide una cita o reunión, solicita los datos necesarios (fecha, hora, nombre) y genera la llamada a la función correspondientes.
          IMPORTANTE: Tus respuestas deben ser CONCRETAS y CORTAS. 
          PROHIBIDO usar símbolos como asteriscos (*), almohadillas (#), guiones (-) o cualquier carácter de formato Markdown, ya que tus respuestas son leídas por un sintetizador de voz que lee literal.
          Habla con fluidez, elegancia y enfoque estratégico en el ROI y el potencial del mercado.`,
        tools: [scheduleAppointmentTool]
      }
    });

    // Check for function calls
    const call = response.functionCalls ? response.functionCalls[0] : null;
    
    if (call && call.name === "schedule_appointment") {
      const args = call.args as any;
      
      if (!auth.currentUser) {
        return "Para agendar una cita en la terminal I LIKE Real Estate, es necesario que inicie sesión primero. De esta forma, podré vincular la sesión con su perfil de inversor.";
      }

      try {
        await crmService.addAppointment({
          userName: args.userName,
          userEmail: auth.currentUser.email || 'N/A',
          date: args.date,
          time: args.time,
          notes: args.notes || 'Agendado vía Asesora IA',
          status: 'Pending',
        }, auth.currentUser.uid, organizationId);
        
        return `Confirmado. He registrado su solicitud de cita para el ${args.date} a las ${args.time} con éxito en la terminal. ¿Hay algún otro indicador de mercado que desee analizar?`;
      } catch (dbError) {
        console.error("Database error during AI scheduling:", dbError);
        return "He detectado una anomalía en la sincronización con el calendario central. Por favor, intente agendar manualmente desde la pestaña de Citas.";
      }
    }

    return response.text || "No pude generar una respuesta. Intenta de nuevo.";
  } catch (error) {
    console.error("AI Service Error:", error);
    if (error instanceof Error) {
      return `Error de IA: ${error.message}. Por favor, verifica la configuración de la clave API o intenta de nuevo.`;
    }
    return "Encontré un error en la telemetría del mercado. Por favor, intenta de nuevo.";
  }
}

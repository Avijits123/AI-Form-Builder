import type { FormSchema, FieldType, FormField } from '../types/form.types';

export interface AIProvider {
  generateSchema(prompt: string): Promise<FormSchema>;
}

export class MockAIProvider implements AIProvider {
  async generateSchema(prompt: string): Promise<FormSchema> {
    // Simulate a network delay of 1.5 seconds for UI loading feedback
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let title = "Custom Form Layout";
    let description = "Form dynamically generated from your AI prompt suggestion.";
    const fields: FormField[] = [];

    const lines = prompt.split('\n');
    const supportedTypes = [
      'text',
      'email',
      'phone',
      'number',
      'date',
      'textarea',
      'select',
      'radio',
      'checkbox',
      'fileupload'
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const lowerLine = trimmed.toLowerCase();

      // Parse Form Title
      if (lowerLine.startsWith('form title:')) {
        title = trimmed.substring('form title:'.length).trim().replace(/^['"“]|['"”]$/g, '');
        continue;
      } else if (lowerLine.startsWith('title:')) {
        title = trimmed.substring('title:'.length).trim().replace(/^['"“]|['"”]$/g, '');
        continue;
      }

      // Parse Description
      if (lowerLine.startsWith('description:')) {
        description = trimmed.substring('description:'.length).trim().replace(/^['"“]|['"”]$/g, '');
        continue;
      }

      // Parse fields using colon separator
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex !== -1) {
        const parts = trimmed.split(':').map((p) => p.trim());
        if (parts.length >= 2) {
          const label = parts[0];
          const rawType = parts[1];
          const normalizedType = rawType.toLowerCase();

          // Only accept the field if the type matches one of our supported field types exactly
          if (supportedTypes.includes(normalizedType)) {
            const type = (normalizedType === 'fileupload' ? 'fileUpload' : normalizedType) as FieldType;
            
            // Convert label to camelCase name safely
            const name = label
              .toLowerCase()
              .replace(/[^a-zA-Z0-9 ]/g, '')
              .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                index === 0 ? word.toLowerCase() : word.toUpperCase()
              )
              .replace(/\s+/g, '');

            let required = false;
            let options: string[] | undefined = undefined;

            // Check optional third/subsequent parameters
            for (let i = 2; i < parts.length; i++) {
              const param = parts[i];
              if (param.toLowerCase() === 'required') {
                required = true;
              } else if (param) {
                options = param.split(',').map((o) => o.trim()).filter(Boolean);
              }
            }

            fields.push({
              type,
              name,
              label,
              ...(required && { required: true }),
              ...(options && options.length > 0 && { options }),
            });
          }
        }
      }
    }

    return {
      title,
      description,
      fields,
    };
  }
}

export const aiService = new MockAIProvider();
export default aiService;

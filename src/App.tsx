import { useState } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import FormRenderer from './renderer/FormRenderer';
import { employeeSchema } from './schemas/employeeSchema';
import type { FormSchema } from './types/form.types';
import aiService from './services/ai.service';
import styles from './App.module.css';

interface FormVersion {
  id: string;
  title: string;
  prompt: string;
  schema: FormSchema;
}

function App() {
  // AI Form Prompt Input State
  const [promptText, setPromptText] = useState(
    "Form Title: Employee Onboarding Form\n\nDescription: Register new employees and collect onboarding information.\n\nFields:\nFull Name : text : required\nEmployee ID : text : required\nPersonal Email : email : required\nDepartment : select : Engineering,HR,Finance,Sales\nEmployment Type : radio : Full Time,Contract,Intern\nProfile Photo : fileUpload\nAccept Terms and Conditions : checkbox : required"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Form Version History State
  const [versions, setVersions] = useState<FormVersion[]>([
    {
      id: 'default',
      title: 'Form 1 (Default)',
      prompt: 'Initial onboarding form layout',
      schema: employeeSchema,
    },
  ]);
  const [activeVersionId, setActiveVersionId] = useState<string>('default');

  // Schema Playground State
  const [jsonText, setJsonText] = useState(JSON.stringify(employeeSchema, null, 2));
  const [parsedSchema, setParsedSchema] = useState<FormSchema>(employeeSchema);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Trigger Mock AI generation based on input prompt
  const handleGenerateForm = async () => {
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setJsonError(null);
    setSubmittedData(null);
    setShowSuccess(false);

    try {
      const generated = await aiService.generateSchema(promptText);

      // Append to the list of versions
      const newVersionNum = versions.length + 1;
      const newVersion: FormVersion = {
        id: `version-${Date.now()}`,
        title: `Form ${newVersionNum}`,
        prompt: promptText,
        schema: generated,
      };

      setVersions((prev) => [...prev, newVersion]);
      setActiveVersionId(newVersion.id);

      // Render the new schema immediately
      setParsedSchema(generated);
      setJsonText(JSON.stringify(generated, null, 2));
    } catch (err) {
      const error = err as Error;
      setJsonError(`AI Generation Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Switch workspace display version
  const handleSwitchVersion = (version: FormVersion) => {
    setActiveVersionId(version.id);
    setParsedSchema(version.schema);
    setJsonText(JSON.stringify(version.schema, null, 2));
    setJsonError(null);
    setSubmittedData(null);
    setShowSuccess(false);
    if (version.id !== 'default') {
      setPromptText(version.prompt);
    }
  };

  // Sync schema edits from editor textarea
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      if (!val.trim()) {
        throw new Error("JSON configuration cannot be empty.");
      }
      const parsed = JSON.parse(val);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error("JSON schema must be a valid JSON object.");
      }
      if (!parsed.title) {
        throw new Error("Schema is missing standard 'title' field.");
      }
      if (!Array.isArray(parsed.fields)) {
        throw new Error("Schema is missing standard 'fields' array.");
      }

      parsed.fields.forEach((field: unknown, idx: number) => {
        const f = field as Record<string, unknown>;
        if (!f || typeof f !== 'object') {
          throw new Error(`Field at index ${idx} must be a valid object.`);
        }
        if (!f.type) {
          throw new Error(`Field at index ${idx} is missing field 'type'.`);
        }
        const validTypes = ['text', 'email', 'phone', 'number', 'date', 'textarea', 'select', 'radio', 'checkbox', 'fileUpload'];
        if (!validTypes.includes(f.type as string)) {
          throw new Error(`Field at index ${idx} has unsupported type "${f.type}". Supported types: ${validTypes.join(', ')}`);
        }
        if (!f.name) {
          throw new Error(`Field at index ${idx} is missing field 'name'.`);
        }
        if (!f.label) {
          throw new Error(`Field at index ${idx} is missing field 'label'.`);
        }
      });

      setParsedSchema(parsed as FormSchema);
      setJsonError(null);
      setSubmittedData(null);
      setShowSuccess(false);
    } catch (err) {
      const error = err as Error;
      setJsonError(error.message);
    }
  };

  // Restore defaults
  const handleResetSchema = () => {
    const defaultText = JSON.stringify(employeeSchema, null, 2);
    setJsonText(defaultText);
    setParsedSchema(employeeSchema);
    setJsonError(null);
    setSubmittedData(null);
    setShowSuccess(false);
  };

  const handleFormSubmit = (data: Record<string, unknown>) => {
    setSubmittedData(data);
    setShowSuccess(true);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>AI Form Builder</h1>
            <span className={styles.badge}>React 19 & TS</span>
          </div>
          <p className={styles.subtitle}>
            Describe your form layout or adjust the JSON code playground manually
          </p>
        </div>
        <Button variant="secondary" onClick={handleResetSchema}>
          Reset Schema Example
        </Button>
      </header>

      <main className={styles.mainContainer}>
        {/* Top Section - AI Form Generator Panel */}
        <section>
          <Card title="Generate Form with AI" description="Use natural language instructions to dynamically create fields, select lists, and dates.">
            <div className={styles.promptForm}>
              <div className={styles.promptInputRow}>
                <textarea
                  className={styles.promptTextarea}
                  placeholder="Describe your form (e.g. 'Create newsletter subscription with: Name, Email, Frequency select')..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  disabled={isGenerating}
                />
                <Button
                  type="button"
                  onClick={handleGenerateForm}
                  isLoading={isGenerating}
                  loadingText="Generating form..."
                  className={styles.promptButton}
                >
                  Generate Form
                </Button>
              </div>
              <div className={styles.promptMetaRow}>
                <span className={styles.metaLabel}>Quick Prompts:</span>
                <div className={styles.chipsList}>
                  <button
                    type="button"
                    className={styles.chip}
                    onClick={() =>
                      setPromptText(
                        "Form Title: Employee Onboarding Form\n\nDescription: Register new employees and collect onboarding information.\n\nFields:\nFull Name : text : required\nEmployee ID : text : required\nPersonal Email : email : required\nDepartment : select : Engineering,HR,Finance,Sales\nEmployment Type : radio : Full Time,Contract,Intern\nProfile Photo : fileUpload\nAccept Terms and Conditions : checkbox : required"
                      )
                    }
                    disabled={isGenerating}
                  >
                    Employee Onboarding
                  </button>
                  <button
                    type="button"
                    className={styles.chip}
                    onClick={() =>
                      setPromptText(
                        "Form Title: Bug Report Form\n\nDescription: Submit a new bug report or issue.\n\nFields:\nIssue Title : text : required\nSeverity : select : Low,Medium,High,Critical\nDiscovery Date : date : required\nReporter Email : email : required\nSteps to Reproduce : textarea\nAttachment : fileUpload"
                      )
                    }
                    disabled={isGenerating}
                  >
                    Bug Tracker
                  </button>
                  <button
                    type="button"
                    className={styles.chip}
                    onClick={() =>
                      setPromptText(
                        "Form Title: Customer Feedback Survey\n\nDescription: Rate your experience with our services.\n\nFields:\nFull Name : text : required\nEmail Address : email\nService Rating : select : Excellent,Good,Fair,Poor\nExperience Date : date : required\nDetailed Feedback : textarea\nWould recommend : radio : Yes,No"
                      )
                    }
                    disabled={isGenerating}
                  >
                    Feedback Survey
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Middle Playground Workspace */}
        <div className={styles.playgroundGrid}>
          {/* Column 1 - Version History Sidebar */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Version History</h2>
            <Card className={styles.sidebarCard}>
              <div className={styles.historyList}>
                {versions.map((ver) => (
                  <button
                    key={ver.id}
                    type="button"
                    className={`${styles.historyItem} ${
                      activeVersionId === ver.id ? styles.activeHistoryItem : ''
                    }`}
                    onClick={() => handleSwitchVersion(ver)}
                  >
                    <span className={styles.historyTitle}>{ver.title}</span>
                    <span className={styles.historyPrompt}>{ver.prompt}</span>
                  </button>
                ))}
                {versions.length === 0 && (
                  <div className={styles.emptyHistory}>No versions saved yet</div>
                )}
              </div>
            </Card>
          </section>

          {/* Column 2 - Generated Form Preview & Submissions */}
          <section className={`${styles.panel} ${styles.previewPanel}`}>
            <h2 className={styles.panelTitle}>Live Preview</h2>
            <Card
              title={parsedSchema.title}
              description={parsedSchema.description}
              className={styles.previewCard}
            >
              {jsonError ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>⚠️</span>
                  <h3>Unable to Render Preview</h3>
                  <p>Correct the JSON syntax or schema rules in the right editor column.</p>
                </div>
              ) : parsedSchema.fields.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📝</span>
                  <h3>No Fields Defined</h3>
                  <p>Use the prompt format <code>Field Name : Field Type : Options/Rules</code> to define fields in your form.</p>
                </div>
              ) : (
                <FormRenderer schema={parsedSchema} onSubmit={handleFormSubmit} />
              )}
            </Card>

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Submitted Payload Viewer</h2>
              <Card>
                {showSuccess && (
                  <div className={styles.successBanner}>
                    <span>✓</span> Form validated and submitted successfully!
                  </div>
                )}
                {submittedData ? (
                  <pre className={styles.jsonResult}>
                    {JSON.stringify(submittedData, null, 2)}
                  </pre>
                ) : (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📋</span>
                    <h3>No Data Received</h3>
                    <p>Enter inputs in the preview panel above and submit the form.</p>
                  </div>
                )}
              </Card>
            </div>
          </section>

          {/* Column 3 - JSON Schema Playground Editor */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span>JSON Schema Editor</span>
              <span
                className={`${styles.statusIndicator} ${
                  jsonError ? styles.statusInvalid : styles.statusValid
                }`}
              >
                {jsonError ? '● Syntax Error' : '● Schema Valid'}
              </span>
            </h2>
            <Card className={styles.schemaCard}>
              <div className={styles.editorContainer}>
                <textarea
                  className={styles.textarea}
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder="Enter JSON Form Schema here..."
                  spellCheck="false"
                  disabled={isGenerating}
                />
                {jsonError && (
                  <div className={styles.errorMessage}>
                    <strong>Parsing Error:</strong>
                    <br />
                    {jsonError}
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
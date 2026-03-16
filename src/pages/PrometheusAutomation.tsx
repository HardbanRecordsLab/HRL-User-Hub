import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Workflow, Play, Pause, Plus, Zap, Calendar, Mail, Database, Trash2, Settings, Clock, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface WorkflowType {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "error";
  triggers: string[];
  actions: string[];
  lastRun: string;
  runsToday: number;
  successRate: number;
}

const PrometheusAutomation = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowType[]>([
    {
      id: "1",
      name: "Automatyczna dystrybucja contentu",
      description: "Publikacja treści na wszystkich kanałach po zatwierdzeniu",
      status: "active",
      triggers: ["Content Approved", "Scheduled Time"],
      actions: ["Publish to Social", "Send Email", "Update Database"],
      lastRun: "2025-12-12 12:30",
      runsToday: 15,
      successRate: 98
    },
    {
      id: "2",
      name: "Monitoring sentymentu i alerty",
      description: "Analiza opinii i powiadomienia o negatywnych reakcjach",
      status: "active",
      triggers: ["New Comment", "New Review"],
      actions: ["Analyze Sentiment", "Send Alert", "Log Event"],
      lastRun: "2025-12-12 13:15",
      runsToday: 42,
      successRate: 95
    },
    {
      id: "3",
      name: "Raportowanie tygodniowe",
      description: "Generowanie i wysyłka raportów co tydzień",
      status: "paused",
      triggers: ["Weekly Schedule"],
      actions: ["Generate Report", "Send Email", "Archive"],
      lastRun: "2025-12-06 09:00",
      runsToday: 0,
      successRate: 100
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger: "",
    actions: [] as string[]
  });

  const triggerOptions = [
    { value: "content_approved", label: "Zatwierdzenie treści", icon: CheckCircle2 },
    { value: "scheduled_time", label: "Zaplanowany czas", icon: Clock },
    { value: "new_comment", label: "Nowy komentarz", icon: Mail },
    { value: "new_release", label: "Nowe wydanie muzyczne", icon: Zap },
    { value: "webhook", label: "Webhook zewnętrzny", icon: Database },
    { value: "low_sentiment", label: "Niski sentyment", icon: AlertTriangle }
  ];

  const actionOptions = [
    { value: "publish_social", label: "Publikuj na Social Media" },
    { value: "send_email", label: "Wyślij Email" },
    { value: "update_database", label: "Aktualizuj bazę danych" },
    { value: "generate_report", label: "Generuj raport" },
    { value: "send_notification", label: "Wyślij powiadomienie" },
    { value: "analyze_sentiment", label: "Analizuj sentyment" },
    { value: "call_webhook", label: "Wywołaj webhook" },
    { value: "create_task", label: "Utwórz zadanie" }
  ];

  const workflowTemplates = [
    {
      icon: Calendar,
      name: "Harmonogram publikacji",
      description: "Automatyczne publikowanie według kalendarza",
      color: "from-blue-500 to-cyan-500",
      trigger: "scheduled_time",
      actions: ["publish_social", "send_notification"]
    },
    {
      icon: Mail,
      name: "E-mail marketing",
      description: "Kampanie emailowe z personalizacją",
      color: "from-purple-500 to-pink-500",
      trigger: "new_release",
      actions: ["send_email", "update_database"]
    },
    {
      icon: Database,
      name: "Synchronizacja danych",
      description: "Integracja między systemami",
      color: "from-green-500 to-emerald-500",
      trigger: "webhook",
      actions: ["update_database", "send_notification"]
    },
    {
      icon: Zap,
      name: "Reakcja na eventy",
      description: "Automatyczne akcje na podstawie zdarzeń",
      color: "from-orange-500 to-red-500",
      trigger: "new_comment",
      actions: ["analyze_sentiment", "send_notification"]
    },
    {
      icon: AlertTriangle,
      name: "Zarządzanie kryzysowe",
      description: "Alerty i reakcja na negatywne opinie",
      color: "from-red-500 to-pink-500",
      trigger: "low_sentiment",
      actions: ["send_notification", "create_task"]
    }
  ];

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const newStatus = w.status === "active" ? "paused" : "active";
        toast({
          title: newStatus === "active" ? "Workflow aktywowany" : "Workflow wstrzymany",
          description: `${w.name} został ${newStatus === "active" ? "uruchomiony" : "zatrzymany"}`
        });
        return { ...w, status: newStatus };
      }
      return w;
    }));
  };

  const deleteWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    setWorkflows(prev => prev.filter(w => w.id !== id));
    toast({
      title: "Workflow usunięty",
      description: `${workflow?.name} został usunięty`
    });
  };

  const createFromTemplate = (template: typeof workflowTemplates[0]) => {
    const newWf: WorkflowType = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      status: "paused",
      triggers: [triggerOptions.find(t => t.value === template.trigger)?.label || template.trigger],
      actions: template.actions.map(a => actionOptions.find(ao => ao.value === a)?.label || a),
      lastRun: "Nigdy",
      runsToday: 0,
      successRate: 100
    };
    setWorkflows(prev => [...prev, newWf]);
    toast({
      title: "Workflow utworzony",
      description: `${template.name} został utworzony z szablonu`
    });
  };

  const createCustomWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.trigger || newWorkflow.actions.length === 0) {
      toast({
        title: "Uzupełnij wszystkie pola",
        description: "Nazwa, wyzwalacz i co najmniej jedna akcja są wymagane",
        variant: "destructive"
      });
      return;
    }

    const newWf: WorkflowType = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      status: "paused",
      triggers: [triggerOptions.find(t => t.value === newWorkflow.trigger)?.label || newWorkflow.trigger],
      actions: newWorkflow.actions.map(a => actionOptions.find(ao => ao.value === a)?.label || a),
      lastRun: "Nigdy",
      runsToday: 0,
      successRate: 100
    };
    setWorkflows(prev => [...prev, newWf]);
    setNewWorkflow({ name: "", description: "", trigger: "", actions: [] });
    setIsDialogOpen(false);
    toast({
      title: "Workflow utworzony",
      description: `${newWorkflow.name} został utworzony`
    });
  };

  const toggleAction = (actionValue: string) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.includes(actionValue)
        ? prev.actions.filter(a => a !== actionValue)
        : [...prev.actions, actionValue]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Automatyzacja Prometheus</h1>
              <p className="text-muted-foreground">Workflowy i orkiestracja zadań z n8n i Node-RED</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{workflows.filter(w => w.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Aktywne</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-500">{workflows.reduce((sum, w) => sum + w.runsToday, 0)}</p>
                <p className="text-sm text-muted-foreground">Wykonań dziś</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
                </p>
                <p className="text-sm text-muted-foreground">Sukces</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">{workflows.length}</p>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="workflows">Moje Workflowy</TabsTrigger>
            <TabsTrigger value="templates">Szablony</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Aktywne Workflowy</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nowy Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Utwórz nowy Workflow</DialogTitle>
                    <DialogDescription>
                      Zdefiniuj automatyzację krok po kroku
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="wf-name">Nazwa workflow</Label>
                      <Input
                        id="wf-name"
                        value={newWorkflow.name}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="np. Automatyczna publikacja"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wf-desc">Opis (opcjonalnie)</Label>
                      <Textarea
                        id="wf-desc"
                        value={newWorkflow.description}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Co robi ten workflow?"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Wyzwalacz</Label>
                      <Select
                        value={newWorkflow.trigger}
                        onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, trigger: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz wyzwalacz" />
                        </SelectTrigger>
                        <SelectContent>
                          {triggerOptions.map((trigger) => (
                            <SelectItem key={trigger.value} value={trigger.value}>
                              <div className="flex items-center gap-2">
                                <trigger.icon className="w-4 h-4" />
                                {trigger.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Akcje</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {actionOptions.map((action) => (
                          <div
                            key={action.value}
                            className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                              newWorkflow.actions.includes(action.value)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => toggleAction(action.value)}
                          >
                            <span className="text-sm">{action.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
                    <Button onClick={createCustomWorkflow}>Utwórz</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {workflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {workflow.name}
                              <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                                {workflow.status === "active" ? "Aktywny" : workflow.status === "paused" ? "Wstrzymany" : "Błąd"}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{workflow.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleWorkflowStatus(workflow.id)}
                          >
                            {workflow.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteWorkflow(workflow.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-2">Wyzwalacze:</p>
                          <div className="flex flex-wrap gap-1">
                            {workflow.triggers.map((trigger, i) => (
                              <Badge key={i} variant="outline">{trigger}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Akcje:</p>
                          <div className="flex flex-wrap gap-1">
                            {workflow.actions.map((action, i) => (
                              <Badge key={i} variant="outline">{action}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Ostatnie uruchomienie:</p>
                          <p className="text-muted-foreground">{workflow.lastRun}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Statystyki dziś:</p>
                          <p className="text-muted-foreground">
                            {workflow.runsToday} wykonań • {workflow.successRate}% sukces
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Szablony Workflow</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                        <template.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">
                            {triggerOptions.find(t => t.value === template.trigger)?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">
                            {template.actions.length} akcji
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => createFromTemplate(template)}
                      >
                        Użyj szablonu
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrometheusAutomation;

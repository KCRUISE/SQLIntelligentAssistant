import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Database, Edit, Trash2 } from "lucide-react";
import { DatabaseSchema, insertDatabaseSchemaSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const schemaFormSchema = insertDatabaseSchemaSchema.extend({
  schemaDataText: z.string().min(1, "Schema data is required"),
});

type SchemaFormData = z.infer<typeof schemaFormSchema>;

export default function SchemaManagerPage() {
  const [selectedSchema, setSelectedSchema] = useState<DatabaseSchema | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schemas, isLoading } = useQuery({
    queryKey: ['/api/schemas', { userId: 'demo-user' }],
    enabled: true,
  });

  const createSchemaMutation = useMutation({
    mutationFn: async (data: SchemaFormData) => {
      const schemaData = JSON.parse(data.schemaDataText);
      const response = await apiRequest('POST', '/api/schemas', {
        ...data,
        schemaData,
        userId: 'demo-user',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Schema Created",
        description: "Database schema has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create schema: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateSchemaMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<SchemaFormData> }) => {
      const schemaData = data.updates.schemaDataText ? JSON.parse(data.updates.schemaDataText) : undefined;
      const response = await apiRequest('PUT', `/api/schemas/${data.id}`, {
        ...data.updates,
        schemaData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Schema Updated",
        description: "Database schema has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update schema: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSchemaMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/schemas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
      setSelectedSchema(null);
      toast({
        title: "Schema Deleted",
        description: "Database schema has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete schema: " + error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<SchemaFormData>({
    resolver: zodResolver(schemaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      dialect: "",
      schemaDataText: "",
    },
  });

  const editForm = useForm<SchemaFormData>({
    resolver: zodResolver(schemaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      dialect: "",
      schemaDataText: "",
    },
  });

  const handleCreateSchema = (data: SchemaFormData) => {
    createSchemaMutation.mutate(data);
  };

  const handleUpdateSchema = (data: SchemaFormData) => {
    if (selectedSchema) {
      updateSchemaMutation.mutate({ id: selectedSchema.id, updates: data });
    }
  };

  const handleDeleteSchema = (id: number) => {
    if (confirm("Are you sure you want to delete this schema?")) {
      deleteSchemaMutation.mutate(id);
    }
  };

  const handleEditSchema = (schema: DatabaseSchema) => {
    setSelectedSchema(schema);
    editForm.reset({
      name: schema.name,
      description: schema.description || "",
      dialect: schema.dialect,
      schemaDataText: JSON.stringify(schema.schemaData, null, 2),
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Schema List */}
      <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Database Schemas</h1>
            <p className="text-muted-foreground">
              Manage your database schemas for better SQL generation
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Schema
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Database Schema</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateSchema)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Production Database" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your database schema..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dialect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Database Dialect</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a database dialect" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="sqlite">SQLite</SelectItem>
                            <SelectItem value="sqlserver">SQL Server</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schemaDataText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schema Data (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"tables": [{"name": "users", "columns": [...]}]}'
                            className="font-mono text-sm"
                            rows={10}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide the database schema in JSON format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSchemaMutation.isPending}>
                      {createSchemaMutation.isPending ? "Creating..." : "Create Schema"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {schemas?.map((schema: DatabaseSchema) => (
            <Card
              key={schema.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedSchema?.id === schema.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedSchema(schema)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {schema.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {schema.dialect.toUpperCase()} • {new Date(schema.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSchema(schema);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSchema(schema.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {schema.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {schema.description}
                  </p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>

        {schemas?.length === 0 && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No database schemas yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first schema to improve SQL generation accuracy
            </p>
          </div>
        )}
      </div>

      {/* Schema Detail */}
      <div className="w-1/2 p-6 overflow-y-auto">
        {selectedSchema ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">{selectedSchema.name}</h2>
              <p className="text-muted-foreground mb-4">
                {selectedSchema.description || "No description provided"}
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Dialect: {selectedSchema.dialect.toUpperCase()}</span>
                <span>Created: {new Date(selectedSchema.createdAt!).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Schema Data</h3>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(selectedSchema.schemaData, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => handleEditSchema(selectedSchema)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Schema
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteSchema(selectedSchema.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Schema
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a schema to view details</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Database Schema</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateSchema)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production Database" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your database schema..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="dialect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Dialect</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a database dialect" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                        <SelectItem value="sqlserver">SQL Server</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="schemaDataText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"tables": [{"name": "users", "columns": [...]}]}'
                        className="font-mono text-sm"
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide the database schema in JSON format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSchemaMutation.isPending}>
                  {updateSchemaMutation.isPending ? "Updating..." : "Update Schema"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

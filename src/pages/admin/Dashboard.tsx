const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido al panel de tu centro de buceo</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <p className="text-sm text-muted-foreground">Próximos Trips</p>
            <p className="text-3xl font-bold text-foreground mt-1">0</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <p className="text-sm text-muted-foreground">Reservas Pendientes</p>
            <p className="text-3xl font-bold text-foreground mt-1">0</p>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <p className="text-sm text-muted-foreground">Buzos Confirmados (este mes)</p>
            <p className="text-3xl font-bold text-foreground mt-1">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

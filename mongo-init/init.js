db = db.getSiblingDB('admin');
db.auth('root', 'rootpassword');

db = db.getSiblingDB('syncflow_local');
db.createUser({
  user: "dev_user",
  pwd: "dev_password",
  roles: [{ role: "readWrite", db: "syncflow_local" }],
});

print("✅ SyncFlow Database Initialized");
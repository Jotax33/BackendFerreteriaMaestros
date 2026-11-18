CREATE USER ferreteria_app WITH PASSWORD 'otra_contraseña_segura';
GRANT CONNECT ON DATABASE ferreteria TO ferreteria_app;
GRANT USAGE ON SCHEMA public TO ferreteria_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ferreteria_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ferreteria_app;
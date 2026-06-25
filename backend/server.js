import app from './src/app.js';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Platform server listening on port ${PORT}`);
    });
}

export default app;

pipeline {
    agent any

    environment {
        // Configurăm variabile de mediu pentru teste
        DB_CONNECTION = 'sqlite'
        DB_DATABASE = ':memory:'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'composer install'
                sh 'cp .env.example .env'
                sh 'php artisan key:generate'
            }
        }

        stage('Run Tests') {
            steps {
                // Rulează testele folosind PHPUnit
                sh 'vendor/bin/phpunit'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finalizat!'
        }
    }
}
<?php
/**
 * Raccourcisseur d'URL – MatheVomFranz
 *
 * Standardmäßig AUS: MatheVomFranz schickt keine Links an Dienste Dritter.
 * Wer einen eigenen Kurz-URL-Dienst betreibt, trägt dessen Adresse in der
 * Umgebungsvariablen MVF_SHORTENER_URL ein (POST-Feld "url", Antwort: die
 * kurze https-Adresse als Klartext).
 */
header('Content-Type: text/plain; charset=utf-8');
$api_url = getenv('MVF_SHORTENER_URL');
if (!$api_url || !isset($_GET['url'])) {
    echo 'disabled';
    exit;
}
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, array('url' => $_GET['url']));
$data = curl_exec($ch);
curl_close($ch);
echo $data;

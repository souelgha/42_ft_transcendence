//----------------------------COLOR/STYLE--------------------------------//

//raquette playerOne
export function firstPaddle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 10;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyle(context);
}

//raquette playerTwo
export function secondPaddle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(6, 7, 7, 0.7)";
	context.shadowOffsetX = -3;
	context.shadowOffsetY = 1;
	context.shadowBlur = 6;

	context.fillRect(element.x, element.y, element.width, element.height);
	resetStyle(context);
}

//ball -> ronde + couleur + ombre
export function ballStyle(context, element)
{
	context.fillStyle = element.color;
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	context.beginPath();
    context.arc(
        element.x + element.width / 2, // Centre X
        element.y + element.height / 2, // Centre Y
        element.width / 1.50, // Rayon
        0, // Début de l'angle
        Math.PI * 2 // Fin de l'angle (cercle complet)
    );
    context.fill();
	// resetStyle(context);
}

export function drawDashedLine(context, canvas) {
    const dashLength = 20;  // Longueur des segments de la ligne pointillée
    const spaceLength = 10; // Longueur des espaces entre les segments
    const centerX = canvas.width / 2;  // X du centre de la ligne
    const startY = 0;  // Début de la ligne (haut de l'écran)
    const endY = canvas.height;  // Fin de la ligne (bas de l'écran)

    // Configuration de la couleur et de la largeur de la ligne
    context.strokeStyle = "black";  // Blanc
    context.lineWidth = 2;  // Largeur de la ligne

    // Calculer le nombre de segments nécessaires
    let currentY = startY;

    // Commencer à dessiner la ligne
    context.beginPath();

    while (currentY < endY) {
        // Dessiner un segment
        context.moveTo(centerX, currentY);
        context.lineTo(centerX, currentY + dashLength);

        // Avancer à la position suivante (pour le prochain segment)
        currentY += dashLength + spaceLength;  // Ajouter un segment + un espace
    }

    // Appliquer le tracé
    context.stroke();
	// resetStyle(context);
}

//----------------------------TEXTE--------------------------------//

//PlayerOne score Text
export function displayScoreOne(context, scoreOne, canvas) {
	context.font = "90px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreOne, (canvas.width / 2) - (canvas.width / 4), 30);
	resetStyle(context);
}

//PlayerTwo score Text
export function displayScoreTwo(context, scoreTwo, canvas){
	context.font = "90px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;
	context.fillText(scoreTwo, (canvas.width / 2) + (canvas.width / 4) , 30);
	resetStyle(context);
}

export function displayPlayerName(context, canvas, infoMatch)
{
	context.font = "30px 'Press Start 2P'";
	context.fillStyle = "black";
	context.textBaseline = "top";
	context.shadowColor = "rgba(0, 0, 0, 0.7)";
	context.shadowOffsetX = -1;
	context.shadowOffsetY = 0;
	context.shadowBlur = 3;

    context.textAlign = "left";
    context.fillText(infoMatch.playerOne, 30, 30);

    context.textAlign = "right";
    context.fillText(infoMatch.playerTwo, canvas.width - 30, 30);

	resetStyle(context);
}

export function drawWalls(context, canvas) {
	context.fillStyle = "rgb(78, 78, 78)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// Top wall
	context.fillRect(0, 0, canvas.width, 5);

	// Bottom wall
	context.fillRect(0, canvas.height - 5, canvas.width, 5);

	context.fillStyle = "rgba(78, 78, 78, 0.48)";  // Changed to darker gray
	context.shadowColor = "rgba(128, 128, 128, 0.7)";  // Matching shadow
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;

	// left wall
	context.fillRect(0, 0, 5, canvas.height);

	// Right wall
	context.fillRect(canvas.width - 5, 0, 5, canvas.height);

	resetStyle(context);
}

function resetStyle(context)
{
	context.shadowColor = "transparent";
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;
}
